import { Injectable } from '@nestjs/common';
import { SkillRepository } from '../repositories/skill.repository';
import { In } from 'typeorm';
import { Skill } from '../entities/skill.entity';

@Injectable()
export class SkillService {
  constructor(private readonly skillRepo: SkillRepository) {}

  async searchSkills(query: string): Promise<Skill[]> {
    return this.skillRepo.searchSkills(query);
  }

  async updateSkills(skillNames: string[]) {
    const existingSkills = await this.skillRepo.find({
      where: {
        skillName: In(skillNames),
      },
    });

    const existingSkillNames = new Set(
      existingSkills.map((skill) => skill.skillName),
    );

    const newSkillNames = skillNames.filter(
      (name) => !existingSkillNames.has(name),
    );

    const newSkills = newSkillNames.map((skillName) =>
      this.skillRepo.create({ skillName }),
    );

    await this.skillRepo.save(newSkills);

    // 새로 저장된 기술과 기존 기술을 합쳐서 반환
    return [...existingSkills, ...newSkills];
  }
}
