import { prisma } from "../config/prisma.js";
import { CreateInternshipInput, UpdateInternshipInput } from "../validation/internship.js";
import { Internship, StatusHistory, Prisma } from "@prisma/client";

export interface FindAllFilters {
  query?: string;
  status?: string;
  sortOrder?: "asc" | "desc";
}

export class InternshipRepository {
  async findAll(filters?: FindAllFilters): Promise<Internship[]> {
    const where: Prisma.InternshipWhereInput = {};

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters?.query) {
      const q = filters.query.trim();
      where.OR = [
        { companyName: { contains: q } },
        { role: { contains: q } },
        { skills: { contains: q } },
      ];
    }

    return prisma.internship.findMany({
      where,
      orderBy: { updatedAt: filters?.sortOrder === "asc" ? "asc" : "desc" },
    });
  }

  async findById(id: string): Promise<Internship | null> {
    return prisma.internship.findUnique({
      where: { id },
    });
  }

  async create(data: CreateInternshipInput): Promise<Internship> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const skillsJson = JSON.stringify(data.skills || []);

      const internship = await tx.internship.create({
        data: {
          companyName: data.companyName,
          role: data.role,
          jobDescription: data.jobDescription,
          skills: skillsJson,
          status: data.status,
          appliedAt: data.appliedAt || new Date(),
          jobUrl: data.jobUrl,
          recruiterEmail: data.recruiterEmail,
          notes: data.notes,
          nextAction: data.nextAction,
          deadline: data.deadline,
        },
      });

      // Initial status history record
      await tx.statusHistory.create({
        data: {
          internshipId: internship.id,
          previousStatus: null,
          newStatus: internship.status,
          source: "MANUAL",
        },
      });

      return internship;
    });
  }

  async updateWithStatusHistory(
    id: string,
    existingStatus: string,
    data: UpdateInternshipInput,
    source: string = "MANUAL",
    relatedEmailId?: string | null
  ): Promise<Internship> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updateData: Prisma.InternshipUpdateInput = {};

      if (data.companyName !== undefined) updateData.companyName = data.companyName;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.jobDescription !== undefined) updateData.jobDescription = data.jobDescription;
      if (data.skills !== undefined) updateData.skills = JSON.stringify(data.skills);
      if (data.status !== undefined) updateData.status = data.status;
      if (data.appliedAt !== undefined) updateData.appliedAt = data.appliedAt;
      if (data.jobUrl !== undefined) updateData.jobUrl = data.jobUrl;
      if (data.recruiterEmail !== undefined) updateData.recruiterEmail = data.recruiterEmail;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.nextAction !== undefined) updateData.nextAction = data.nextAction;
      if (data.deadline !== undefined) updateData.deadline = data.deadline;

      const updated = await tx.internship.update({
        where: { id },
        data: updateData,
      });

      // Record status change if status changed
      if (data.status && data.status !== existingStatus) {
        await tx.statusHistory.create({
          data: {
            internshipId: id,
            previousStatus: existingStatus,
            newStatus: data.status,
            source,
            relatedEmailId: relatedEmailId || null,
          },
        });
      }

      return updated;
    });
  }

  async delete(id: string): Promise<Internship> {
    return prisma.internship.delete({
      where: { id },
    });
  }

  async findHistoryByInternshipId(internshipId: string): Promise<StatusHistory[]> {
    return prisma.statusHistory.findMany({
      where: { internshipId },
      orderBy: { changedAt: "desc" },
    });
  }

  async importMany(items: CreateInternshipInput[]): Promise<Internship[]> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdList: Internship[] = [];
      for (const data of items) {
        const skillsJson = JSON.stringify(data.skills || []);
        const internship = await tx.internship.create({
          data: {
            companyName: data.companyName,
            role: data.role,
            jobDescription: data.jobDescription,
            skills: skillsJson,
            status: data.status,
            appliedAt: data.appliedAt || new Date(),
            jobUrl: data.jobUrl,
            recruiterEmail: data.recruiterEmail,
            notes: data.notes,
            nextAction: data.nextAction,
            deadline: data.deadline,
          },
        });

        await tx.statusHistory.create({
          data: {
            internshipId: internship.id,
            previousStatus: null,
            newStatus: internship.status,
            source: "IMPORT",
          },
        });
        createdList.push(internship);
      }
      return createdList;
    });
  }
}

export const internshipRepository = new InternshipRepository();
