import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import {
  ENV_AWS_ACCESS_KEY_ID_KEY,
  ENV_AWS_REGION_KEY,
  ENV_AWS_S3_BUCKET_NAME_KEY,
  ENV_AWS_SECRET_ACCESS_KEY,
} from 'src/common/const';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const region = configService.get<string>(ENV_AWS_REGION_KEY);
    this.s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: configService.get<string>(ENV_AWS_ACCESS_KEY_ID_KEY),
        secretAccessKey: configService.get<string>(ENV_AWS_SECRET_ACCESS_KEY),
      },
      endpoint: `https://s3.${region}.amazonaws.com`,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const encodedFileName = encodeURIComponent(file.originalname);
    const key = `${uuidv4()}-${encodedFileName}`;
    const bucket = this.configService.get<string>(ENV_AWS_S3_BUCKET_NAME_KEY);
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ACL: 'public-read',
    });

    try {
      await this.s3Client.send(command);
      const url = `https://${bucket}.s3.${this.configService.get<string>(ENV_AWS_REGION_KEY)}.amazonaws.com/${key}`;
      return url;
    } catch (error) {
      throw new Error('Failed to upload file to S3: ' + error.message);
    }
  }

  async deleteFile(url: string): Promise<void> {
    const bucket = this.configService.get<string>(ENV_AWS_S3_BUCKET_NAME_KEY);
    const key = decodeURIComponent(url.split('/').pop()!);

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      throw new Error('Failed to delete file from S3: ' + error.message);
    }
  }
}
