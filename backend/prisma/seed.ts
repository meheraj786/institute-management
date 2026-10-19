import "dotenv/config";
import bcrypt from "bcrypt";
import { Status, UserRole } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

async function seedAdmin() {
  const email = process.env.adminMail?.trim();
  const password = process.env.password;

  if (!email || !password?.trim()) {
    throw new Error(
      "adminMail and password must be configured in backend/.env",
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.role !== UserRole.ADMIN) {
    throw new Error(
      "The configured admin email already belongs to a non-admin user",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: "Super Admin",
          password: hashedPassword,
          status: Status.ACTIVE,
        },
        select: { id: true, email: true, role: true, status: true },
      })
    : await prisma.user.create({
        data: {
          name: "Super Admin",
          email,
          password: hashedPassword,
          role: UserRole.ADMIN,
          status: Status.ACTIVE,
        },
        select: { id: true, email: true, role: true, status: true },
      });

  console.log(
    `Admin account ${existing ? "updated" : "created"} (id: ${user.id})`,
  );
}

try {
  await seedAdmin();
} catch {
  console.error(
    "Admin seed failed. Check the configured env values and database connection.",
  );
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
