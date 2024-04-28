// pages/api/posts/[id].ts (PUT and DELETE)
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const PUT = async (req: NextRequest) => {
    const { id } = req.nextUrl.searchParams;
    const { updatedTitle, updatedContent } = await req.json();

    const updatedPost = await prisma.post.update({
        where: { id: id as string },
        data: {
            title: updatedTitle,
            content: updatedContent,
        },
    });

    return NextResponse.json(updatedPost);
};

export const DELETE = async (req: NextRequest) => {
    const { id } = req.nextUrl.searchParams;
    const deletedPost = await prisma.post.delete({
        where: { id: id as string },
    });
    return NextResponse.json(deletedPost);
};