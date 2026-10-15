import {
  internshipRepository,
  InternshipRepository,
} from "../repositories/internshipRepository.js";
import {
  CreateInternshipInput,
  UpdateInternshipInput,
} from "../validation/internship.js";
import { NotFoundError } from "../errors/appError.js";
import { Internship, StatusHistory } from "@prisma/client";

export interface FormattedInternship extends Omit<Internship, "skills"> {
  skills: string[];
}

function formatInternship(internship: Internship): FormattedInternship {
  let parsedSkills: string[] = [];
  try {
    parsedSkills = JSON.parse(internship.skills);
    if (!Array.isArray(parsedSkills)) parsedSkills = [];
  } catch {
    parsedSkills = [];
  }

  return {
    ...internship,
    skills: parsedSkills,
  };
}

export class InternshipService {
  constructor(private repo: InternshipRepository = internshipRepository) {}

  async getAllInternships(): Promise<FormattedInternship[]> {
    const list = await this.repo.findAll();
    return list.map(formatInternship);
  }

  async getInternshipById(id: string): Promise<FormattedInternship> {
    const internship = await this.repo.findById(id);
    if (!internship) {
      throw new NotFoundError(`Internship with ID '${id}' not found`);
    }
    return formatInternship(internship);
  }

  async createInternship(
    data: CreateInternshipInput
  ): Promise<FormattedInternship> {
    const created = await this.repo.create(data);
    return formatInternship(created);
  }

  async updateInternship(
    id: string,
    data: UpdateInternshipInput,
    source: string = "MANUAL",
    relatedEmailId?: string | null
  ): Promise<FormattedInternship> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Internship with ID '${id}' not found`);
    }

    const updated = await this.repo.updateWithStatusHistory(
      id,
      existing.status,
      data,
      source,
      relatedEmailId
    );
    return formatInternship(updated);
  }

  async deleteInternship(id: string): Promise<FormattedInternship> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Internship with ID '${id}' not found`);
    }

    const deleted = await this.repo.delete(id);
    return formatInternship(deleted);
  }

  async getStatusHistory(id: string): Promise<StatusHistory[]> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Internship with ID '${id}' not found`);
    }

    return this.repo.findHistoryByInternshipId(id);
  }
}

export const internshipService = new InternshipService();
