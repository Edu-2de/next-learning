import "dotenv/config";
import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";
import { db } from "./index";
import { comments, issues } from "./schema";

const issueNames = [
  "Add dark mode support",
  "Fix responsive layout on mobile",
  "Implement user authentication",
  "Update dependencies to latest versions",
  "Add unit tests for API endpoints",
  "Improve page load performance",
  "Fix memory leak in dashboard",
  "Add keyboard shortcuts",
  "Implement search functionality",
  "Add export to CSV feature",
  "Fix timezone handling",
  "Add email notifications",
  "Improve error messages",
  "Add documentation for API",
  "Fix security vulnerability in auth",
  "Add analytics dashboard",
  "Implement real-time updates",
  "Add multi-language support",
  "Fix layout shift issues",
  "Add drag and drop support",
  "Optimize database queries",
  "Add pagination to lists",
  "Fix color contrast issues",
  "Add offline mode support",
  "Implement caching strategy",
  "Add rate limiting",
  "Fix cross-browser compatibility",
  "Add accessibility features",
  "Improve mobile navigation",
  "Add image optimization",
  "Fix date picker bug",
  "Add bulk actions",
  "Implement webhooks",
  "Add custom themes",
  "Fix validation errors",
];

async function main() {
  console.log("🗑️  Resetting database...");

  // Truncate tables
  await db.execute(sql`TRUNCATE TABLE comments CASCADE`);
  await db.execute(sql`TRUNCATE TABLE issues CASCADE`);

  // Reset sequence to 0
  await db.execute(sql`ALTER SEQUENCE issue_number_seq RESTART WITH 0`);

  console.log("🌱 Seeding database...");

  // Insert 25 issues
  for (let i = 0; i < 25; i++) {
    const randomTitle =
      issueNames[Math.floor(Math.random() * issueNames.length)];
    const randomLikes = Math.floor(Math.random() * 21); // 0-20
    const statuses = ["backlog", "todo", "in_progress", "done"] as const;
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const [issue] = await db
      .insert(issues)
      .values({
        title: randomTitle,
        description: `Description for ${randomTitle}`,
        status: randomStatus,
        likes: randomLikes,
      })
      .returning();

    // Insert 5 comments per issue
    for (let j = 0; j < 5; j++) {
      await db.insert(comments).values({
        issueId: issue.id,
        authorName: `User ${j + 1}`,
        authorAvatar: `https://i.pravatar.cc/150?u=${j}`,
        text: `This is comment ${j + 1} for issue ${issue.issueNumber}`,
      });
    }
  }

  const statuses = ["backlog", "todo", "in_progress", "done"] as const;

  // Insert 25 issues
  for (let i = 0; i < 25; i++) {
    const randomTitle = faker.helpers.arrayElement(issueNames);
    const randomLikes = faker.number.int({ min: 0, max: 20 });
    const randomStatus = faker.helpers.arrayElement(statuses);

    const [issue] = await db
      .insert(issues)
      .values({
        title: randomTitle,
        description: faker.lorem.paragraph(),
        status: randomStatus,
        likes: randomLikes,
      })
      .returning();

    // Insert 5 comments per issue
    for (let j = 0; j < 5; j++) {
      await db.insert(comments).values({
        issueId: issue.id,
        authorName: faker.person.fullName(),
        authorAvatar: faker.image.avatar(),
        text: faker.lorem.sentence(),
      });
    }
  }

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
