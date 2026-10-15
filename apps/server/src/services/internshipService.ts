import {
  internshipRepository,
  InternshipRepository,
  FindAllFilters,
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

  async getAllInternships(filters?: FindAllFilters): Promise<FormattedInternship[]> {
    const list = await this.repo.findAll(filters);
    return list.map(formatInternship);
  }

  async exportData(
    format: "json" | "csv" = "json"
  ): Promise<{ content: string; contentType: string; filename: string }> {
    const list = await this.getAllInternships();

    if (format === "csv") {
      const headers = [
        "ID",
        "Company",
        "Role",
        "Status",
        "AppliedDate",
        "Skills",
        "JobUrl",
        "RecruiterEmail",
        "NextAction",
        "Deadline",
        "Notes",
        "UpdatedAt",
      ];

      const escapeCsv = (str: string | undefined | null) => {
        if (str === null || str === undefined) return "";
        const text = String(str).replace(/"/g, '""');
        return `"${text}"`;
      };

      const rows = list.map((item) =>
        [
          escapeCsv(item.id),
          escapeCsv(item.companyName),
          escapeCsv(item.role),
          escapeCsv(item.status),
          escapeCsv(item.appliedAt ? new Date(item.appliedAt).toISOString() : ""),
          escapeCsv(item.skills.join("; ")),
          escapeCsv(item.jobUrl),
          escapeCsv(item.recruiterEmail),
          escapeCsv(item.nextAction),
          escapeCsv(item.deadline ? new Date(item.deadline).toISOString() : ""),
          escapeCsv(item.notes),
          escapeCsv(item.updatedAt ? new Date(item.updatedAt).toISOString() : ""),
        ].join(",")
      );

      const content = [headers.join(","), ...rows].join("\n");
      return {
        content,
        contentType: "text/csv",
        filename: `hiro-internships-${new Date().toISOString().split("T")[0]}.csv`,
      };
    }

    const content = JSON.stringify(list, null, 2);
    return {
      content,
      contentType: "application/json",
      filename: `hiro-internships-${new Date().toISOString().split("T")[0]}.json`,
    };
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
