import mongoose, { Model, Document } from "mongoose";
import { IBaseRepository } from "../interfaces/IRepository.interface";
import { PaginationOptions, PaginatedResult } from "../types/common.types";
import { isConnectedToMongo } from "../config/db";

export abstract class BaseRepository<T, M extends Document> implements IBaseRepository<T> {
  constructor(
    protected readonly model: Model<M>,
    protected readonly memoryCollection: any[]
  ) {}

  protected isDbAvailable(): boolean {
    return isConnectedToMongo;
  }

  async findById(id: string): Promise<T | null> {
    if (this.isDbAvailable()) {
      try {
        const doc = await this.model.findById(id).lean();
        if (doc) return this.mapToEntity(doc);
      } catch (err) {
        // Fallback to memory collection
      }
    }
    const memItem = this.memoryCollection.find((item) => (item._id || item.id)?.toString() === id.toString());
    return memItem ? this.mapToEntity(memItem) : null;
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    if (this.isDbAvailable()) {
      try {
        const doc = await this.model.findOne(filter).lean();
        if (doc) return this.mapToEntity(doc);
      } catch (err) {
        // Fallback
      }
    }
    const memItem = this.memoryCollection.find((item) => {
      return Object.entries(filter).every(([key, val]) => {
        const itemVal = item[key] !== undefined ? item[key] : (key === "id" ? item._id : undefined);
        return itemVal?.toString() === val?.toString();
      });
    });
    return memItem ? this.mapToEntity(memItem) : null;
  }

  async find(filter: Record<string, any> = {}, options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const skip = (page - 1) * limit;

    if (this.isDbAvailable()) {
      try {
        const sortField = options.sortBy || "createdAt";
        const sortOrder = options.sortOrder === "asc" ? 1 : -1;

        const [docs, total] = await Promise.all([
          this.model
            .find(filter)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(),
          this.model.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limit) || 1;

        return {
          data: docs.map((d) => this.mapToEntity(d)),
          pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        };
      } catch (err) {
        // Fallback
      }
    }

    const filtered = this.memoryCollection.filter((item) => {
      return Object.entries(filter).every(([key, val]) => {
        const itemVal = item[key] !== undefined ? item[key] : (key === "id" ? item._id : undefined);
        return itemVal?.toString() === val?.toString();
      });
    });

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: paginated.map((item) => this.mapToEntity(item)),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async create(item: Partial<T>): Promise<T> {
    const id =
      (item as any).id ||
      (item as any)._id ||
      new mongoose.Types.ObjectId().toString();
    const now = new Date();
    const entityData = {
      ...item,
      _id: id,
      id,
      createdAt: (item as any).createdAt || now,
      updatedAt: now,
    };

    if (this.isDbAvailable()) {
      try {
        const createdDoc = await this.model.create(entityData);
        return this.mapToEntity(createdDoc.toObject());
      } catch (err) {
        // Fallback to memory
      }
    }

    this.memoryCollection.unshift(entityData);
    return this.mapToEntity(entityData);
  }

  async update(id: string, item: Partial<T>): Promise<T | null> {
    const now = new Date();
    const updateData = { ...item, updatedAt: now };

    if (this.isDbAvailable()) {
      try {
        const doc = await this.model.findByIdAndUpdate(id, updateData, { new: true }).lean();
        if (doc) return this.mapToEntity(doc);
      } catch (err) {
        // Fallback
      }
    }

    const index = this.memoryCollection.findIndex((i) => (i._id || i.id)?.toString() === id.toString());
    if (index !== -1) {
      this.memoryCollection[index] = { ...this.memoryCollection[index], ...updateData };
      return this.mapToEntity(this.memoryCollection[index]);
    }

    return null;
  }

  async delete(id: string): Promise<boolean> {
    if (this.isDbAvailable()) {
      try {
        const res = await this.model.findByIdAndDelete(id);
        if (res) return true;
      } catch (err) {
        // Fallback
      }
    }

    const index = this.memoryCollection.findIndex((i) => (i._id || i.id)?.toString() === id.toString());
    if (index !== -1) {
      this.memoryCollection.splice(index, 1);
      return true;
    }
    return false;
  }

  async count(filter: Record<string, any> = {}): Promise<number> {
    if (this.isDbAvailable()) {
      try {
        return await this.model.countDocuments(filter);
      } catch (err) {}
    }
    return this.memoryCollection.filter((item) => {
      return Object.entries(filter).every(([key, val]) => {
        const itemVal = item[key] !== undefined ? item[key] : (key === "id" ? item._id : undefined);
        return itemVal?.toString() === val?.toString();
      });
    }).length;
  }

  protected abstract mapToEntity(doc: any): T;
}
