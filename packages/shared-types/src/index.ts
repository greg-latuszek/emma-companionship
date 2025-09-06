// Shared TypeScript types and interfaces for Emma Companionship
// This file will be populated as development progresses

export type UUID = string;

// Placeholder types - to be expanded based on data models
export interface BaseEntity {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
}

// Export all types from this package
export * from './index';
