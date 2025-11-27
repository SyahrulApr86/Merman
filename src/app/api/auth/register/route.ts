import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { login } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { name, username, email, password } = await request.json();

        if (!name || !username || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await db
            .select()
            .from(users)
            .where(or(eq(users.email, email), eq(users.username, username)))
            .limit(1);

        if (existingUser.length > 0) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const [newUser] = await db
            .insert(users)
            .values({
                name,
                username,
                email,
                passwordHash,
            })
            .returning();

        // Create session
        await login({ id: newUser.id, username: newUser.username, name: newUser.name });

        return NextResponse.json({ success: true, user: newUser });
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
