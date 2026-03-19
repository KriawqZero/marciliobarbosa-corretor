import { NextResponse } from "next/server";
import { env } from "process";
import { PrismaClient } from "@/generated/prisma/client";
import {
  PropertyCity,
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
} from "@/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

type PropertyImageInput = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sortOrder?: number;
};

type CreatePropertyInput = {
  slug: string;
  title: string;
  purpose: (typeof PropertyPurpose)[keyof typeof PropertyPurpose];
  type: (typeof PropertyType)[keyof typeof PropertyType];
  city: (typeof PropertyCity)[keyof typeof PropertyCity];
  citySlug: string;
  neighborhood: string;
  price: number;
  priceSuffix?: string | null;
  priceNote?: string | null;
  shortDescription: string;
  longDescription: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpaces?: number | null;
  totalArea: number;
  builtArea?: number | null;
  coverImageUrl: string;
  featured?: boolean;
  specialOpportunity?: boolean;
  tags?: string[];
  status?: (typeof PropertyStatus)[keyof typeof PropertyStatus];
  whatsappMessage: string;
  images?: PropertyImageInput[];
};

type UpdatePropertyInput = Partial<CreatePropertyInput> & {
  id?: string;
};

function isValidEnumValue<T extends Record<string, string>>(
  enumObject: T,
  value: unknown
): value is T[keyof T] {
  return typeof value === "string" && Object.values(enumObject).includes(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function normalizeImages(images: PropertyImageInput[] | undefined) {
  if (!images) return undefined;
  return images
    .filter(
      (img) =>
        isNonEmptyString(img?.src) &&
        isNonEmptyString(img?.alt) &&
        Number.isFinite(img?.width) &&
        Number.isFinite(img?.height)
    )
    .map((img, index) => ({
      src: img.src,
      alt: img.alt,
      width: Number(img.width),
      height: Number(img.height),
      sortOrder: Number.isFinite(img.sortOrder) ? Number(img.sortOrder) : index,
    }));
}

function serializeProperty(property: {
  id: string;
  slug: string;
  title: string;
  purpose: string;
  type: string;
  city: string;
  citySlug: string;
  neighborhood: string;
  price: number;
  priceSuffix: string | null;
  priceNote: string | null;
  shortDescription: string;
  longDescription: string;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
  totalArea: number;
  builtArea: number | null;
  coverImageUrl: string;
  featured: boolean;
  specialOpportunity: boolean;
  tags: string[];
  status: string;
  whatsappMessage: string;
  createdAt: Date;
  updatedAt: Date;
  images?: Array<{
    id: string;
    src: string;
    alt: string;
    width: number;
    height: number;
    sortOrder: number;
  }>;
}) {
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    purpose: property.purpose,
    type: property.type,
    city: property.city,
    citySlug: property.citySlug,
    neighborhood: property.neighborhood,
    price: property.price,
    priceSuffix: property.priceSuffix,
    priceNote: property.priceNote,
    shortDescription: property.shortDescription,
    longDescription: property.longDescription,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    parkingSpaces: property.parkingSpaces,
    totalArea: property.totalArea,
    builtArea: property.builtArea,
    coverImage: property.coverImageUrl,
    featured: property.featured,
    specialOpportunity: property.specialOpportunity,
    tags: property.tags,
    status: property.status,
    whatsappMessage: property.whatsappMessage,
    gallery: property.images?.map((img) => ({
      id: img.id,
      src: img.src,
      alt: img.alt,
      width: img.width,
      height: img.height,
      sortOrder: img.sortOrder,
    })),
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };
}

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length);
  return token === env.API_PASSWORD;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const slug = url.searchParams.get("slug");

    if (id || slug) {
      const property = await prisma.property.findFirst({
        where: {
          ...(id ? { id } : {}),
          ...(slug ? { slug } : {}),
        },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      if (!property) {
        return NextResponse.json(
          { error: "Imóvel não encontrado." },
          { status: 404 }
        );
      }

      return NextResponse.json({ property: serializeProperty(property) });
    }

    const purpose = url.searchParams.get("purpose");
    const type = url.searchParams.get("type");
    const city = url.searchParams.get("city");
    const citySlug = url.searchParams.get("citySlug");
    const status = url.searchParams.get("status");
    const featured = parseBoolean(url.searchParams.get("featured"));
    const specialOpportunity = parseBoolean(
      url.searchParams.get("specialOpportunity")
    );
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const bedrooms = url.searchParams.get("bedrooms");
    const search = url.searchParams.get("search");
    const page = Math.max(Number(url.searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit") || "20"), 1),
      100
    );

    const where: Record<string, unknown> = {};

    if (isValidEnumValue(PropertyPurpose, purpose)) where.purpose = purpose;
    if (isValidEnumValue(PropertyType, type)) where.type = type;
    if (isValidEnumValue(PropertyCity, city)) where.city = city;
    if (isValidEnumValue(PropertyStatus, status)) where.status = status;
    if (isNonEmptyString(citySlug)) where.citySlug = citySlug;
    if (featured !== undefined) where.featured = featured;
    if (specialOpportunity !== undefined) {
      where.specialOpportunity = specialOpportunity;
    }

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: Number(minPrice) } : {}),
        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
      };
    }

    if (bedrooms && Number.isFinite(Number(bedrooms))) {
      where.bedrooms = { gte: Number(bedrooms) };
    }

    if (isNonEmptyString(search)) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { neighborhood: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      properties: properties.map(serializeProperty),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Erro ao buscar imóveis.",
        detail: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data: CreatePropertyInput = await req.json();

    if (
      !isNonEmptyString(data.slug) ||
      !isNonEmptyString(data.title) ||
      !isValidEnumValue(PropertyPurpose, data.purpose) ||
      !isValidEnumValue(PropertyType, data.type) ||
      !isValidEnumValue(PropertyCity, data.city) ||
      !isNonEmptyString(data.citySlug) ||
      !isNonEmptyString(data.neighborhood) ||
      !Number.isFinite(data.price) ||
      !isNonEmptyString(data.shortDescription) ||
      !isNonEmptyString(data.longDescription) ||
      !Number.isFinite(data.totalArea) ||
      !isNonEmptyString(data.coverImageUrl) ||
      !isNonEmptyString(data.whatsappMessage)
    ) {
      return NextResponse.json(
        { error: "Payload inválido para criação de imóvel." },
        { status: 400 }
      );
    }

    if (data.status && !isValidEnumValue(PropertyStatus, data.status)) {
      return NextResponse.json(
        { error: "Status inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.property.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe um imóvel com este slug." },
        { status: 409 }
      );
    }

    const normalizedImages = normalizeImages(data.images);

    const property = await prisma.property.create({
      data: {
        slug: data.slug,
        title: data.title,
        purpose: data.purpose,
        type: data.type,
        city: data.city,
        citySlug: data.citySlug,
        neighborhood: data.neighborhood,
        price: Number(data.price),
        priceSuffix: data.priceSuffix ?? null,
        priceNote: data.priceNote ?? null,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        parkingSpaces: data.parkingSpaces ?? null,
        totalArea: Number(data.totalArea),
        builtArea: data.builtArea ?? null,
        coverImageUrl: data.coverImageUrl,
        featured: data.featured ?? false,
        specialOpportunity: data.specialOpportunity ?? false,
        tags: Array.isArray(data.tags) ? data.tags : [],
        status: data.status ?? PropertyStatus.disponivel,
        whatsappMessage: data.whatsappMessage,
        images: normalizedImages
          ? {
              create: normalizedImages,
            }
          : undefined,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(
      { property: serializeProperty(property) },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Erro ao criar imóvel.",
        detail: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data: UpdatePropertyInput = await req.json();

    if (!isNonEmptyString(data.id) && !isNonEmptyString(data.slug)) {
      return NextResponse.json(
        { error: "Informe `id` ou `slug` para atualizar o imóvel." },
        { status: 400 }
      );
    }

    const existing = await prisma.property.findFirst({
      where: {
        ...(isNonEmptyString(data.id) ? { id: data.id } : {}),
        ...(isNonEmptyString(data.slug) ? { slug: data.slug } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Imóvel não encontrado." },
        { status: 404 }
      );
    }

    if (data.purpose && !isValidEnumValue(PropertyPurpose, data.purpose)) {
      return NextResponse.json(
        { error: "Finalidade inválida." },
        { status: 400 }
      );
    }
    if (data.type && !isValidEnumValue(PropertyType, data.type)) {
      return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
    }
    if (data.city && !isValidEnumValue(PropertyCity, data.city)) {
      return NextResponse.json({ error: "Cidade inválida." }, { status: 400 });
    }
    if (data.status && !isValidEnumValue(PropertyStatus, data.status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    const normalizedImages = Array.isArray(data.images)
      ? normalizeImages(data.images)
      : undefined;

    await prisma.property.update({
      where: { id: existing.id },
      data: {
        ...(isNonEmptyString(data.slug) ? { slug: data.slug } : {}),
        ...(isNonEmptyString(data.title) ? { title: data.title } : {}),
        ...(data.purpose ? { purpose: data.purpose } : {}),
        ...(data.type ? { type: data.type } : {}),
        ...(data.city ? { city: data.city } : {}),
        ...(isNonEmptyString(data.citySlug) ? { citySlug: data.citySlug } : {}),
        ...(isNonEmptyString(data.neighborhood)
          ? { neighborhood: data.neighborhood }
          : {}),
        ...(Number.isFinite(data.price) ? { price: Number(data.price) } : {}),
        ...(data.priceSuffix !== undefined ? { priceSuffix: data.priceSuffix } : {}),
        ...(data.priceNote !== undefined ? { priceNote: data.priceNote } : {}),
        ...(isNonEmptyString(data.shortDescription)
          ? { shortDescription: data.shortDescription }
          : {}),
        ...(isNonEmptyString(data.longDescription)
          ? { longDescription: data.longDescription }
          : {}),
        ...(data.bedrooms !== undefined ? { bedrooms: data.bedrooms } : {}),
        ...(data.bathrooms !== undefined ? { bathrooms: data.bathrooms } : {}),
        ...(data.parkingSpaces !== undefined
          ? { parkingSpaces: data.parkingSpaces }
          : {}),
        ...(Number.isFinite(data.totalArea)
          ? { totalArea: Number(data.totalArea) }
          : {}),
        ...(data.builtArea !== undefined ? { builtArea: data.builtArea } : {}),
        ...(isNonEmptyString(data.coverImageUrl)
          ? { coverImageUrl: data.coverImageUrl }
          : {}),
        ...(data.featured !== undefined ? { featured: data.featured } : {}),
        ...(data.specialOpportunity !== undefined
          ? { specialOpportunity: data.specialOpportunity }
          : {}),
        ...(Array.isArray(data.tags) ? { tags: data.tags } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(isNonEmptyString(data.whatsappMessage)
          ? { whatsappMessage: data.whatsappMessage }
          : {}),
        ...(normalizedImages
          ? {
              images: {
                deleteMany: {},
                create: normalizedImages,
              },
            }
          : {}),
      },
    });

    const property = await prisma.property.findUnique({
      where: { id: existing.id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({
      property: property ? serializeProperty(property) : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Erro ao atualizar imóvel.",
        detail: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const idFromQuery = url.searchParams.get("id");
    const slugFromQuery = url.searchParams.get("slug");

    let id = idFromQuery;
    let slug = slugFromQuery;

    if (!id && !slug) {
      const body = await req.json().catch(() => ({}));
      id = body?.id ?? null;
      slug = body?.slug ?? null;
    }

    if (!isNonEmptyString(id) && !isNonEmptyString(slug)) {
      return NextResponse.json(
        { error: "Informe `id` ou `slug` para remover o imóvel." },
        { status: 400 }
      );
    }

    const existing = await prisma.property.findFirst({
      where: {
        ...(isNonEmptyString(id) ? { id } : {}),
        ...(isNonEmptyString(slug) ? { slug } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Imóvel não encontrado." },
        { status: 404 }
      );
    }

    await prisma.property.delete({ where: { id: existing.id } });

    return NextResponse.json({ message: "Imóvel removido com sucesso." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Erro ao remover imóvel.",
        detail: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
