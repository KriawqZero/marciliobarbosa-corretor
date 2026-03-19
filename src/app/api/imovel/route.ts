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
import { moveObject, generateFinalPath, generateTempPath } from "@/lib/storage";

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
  slug?: string;
  title: string;
  purpose: (typeof PropertyPurpose)[keyof typeof PropertyPurpose];
  type: (typeof PropertyType)[keyof typeof PropertyType];
  city: (typeof PropertyCity)[keyof typeof PropertyCity];
  citySlug?: string;
  neighborhood?: string;
  price: number | string;
  priceSuffix?: string | null;
  priceNote?: string | null;
  shortDescription?: string;
  longDescription?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpaces?: number | null;
  totalArea?: number | string;
  builtArea?: number | null;
  coverImageUrl?: string;
  featured?: boolean;
  specialOpportunity?: boolean;
  tags?: string[];
  status?: (typeof PropertyStatus)[keyof typeof PropertyStatus];
  whatsappMessage?: string;
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

function extractTempIdFromUrl(url: string): string | null {
  const match = url.match(/\/temp\/([^/]+)\//);
  return match ? match[1] : null;
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

function slugify(input: string): string {
  const normalized = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
  // Troca qualquer sequência de caracteres não alfanuméricos por hífen
  const slug = normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug.length > 0 ? slug : 'imovel'
}

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  const attemptBase = baseSlug.trim()
  let candidate = attemptBase

  for (let i = 2; i < 1000; i++) {
    const existing = await prisma.property.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
    if (!existing) return candidate
    candidate = `${attemptBase}-${i}`
  }

  // Fallback: mesmo em cenários extremos, não deixa quebrar a criação.
  return `${attemptBase}-${Date.now()}`
}

const DEFAULT_NEIGHBORHOOD = 'A definir'
const DEFAULT_TOTAL_AREA = 1
const DEFAULT_COVER_IMAGE_URL =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop&q=80'

function buildShortDescription({
  title,
  city,
}: {
  title: string
  city: string
}): string {
  return `${title} em ${city}.`
}

function buildDefaultWhatsappMessage({
  title,
  slug,
  siteUrl,
}: {
  title: string
  slug: string
  siteUrl: string
}): string {
  const url = `${siteUrl}/imovel/${slug}`
  return `Olá! Tenho interesse no imóvel "${title}". Podemos conversar? Link: ${url}`
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
    const rawPage = Number(url.searchParams.get("page") || "1");
    const rawLimit = Number(url.searchParams.get("limit") || "20");
    const page =
      Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(Math.floor(rawLimit), 100)
        : 20;

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

    const pages = Math.ceil(total / limit);
    const hasPrev = page > 1;
    const hasNext = page < pages;

    return NextResponse.json({
      total,
      page,
      limit,
      pages,
      hasPrev,
      hasNext,
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

    const data = await req.json();

    // Campos mínimos para permitir cadastro em lote.
    // Mantemos compatibilidade: se o cliente enviar outros campos, eles também serão usados.
    const title = typeof data?.title === 'string' ? data.title.trim() : '';
    const purpose = data?.purpose;
    const type = data?.type;
    const city = data?.city;
    const priceNumber = Number(data?.price);

    if (
      !isNonEmptyString(title) ||
      !isValidEnumValue(PropertyPurpose, purpose) ||
      !isValidEnumValue(PropertyType, type) ||
      !isValidEnumValue(PropertyCity, city) ||
      !Number.isFinite(priceNumber)
    ) {
      return NextResponse.json(
        { error: "Payload inválido para criação de imóvel (mínimo: title, price, city, type, purpose)." },
        { status: 400 }
      );
    }

    const siteUrl = env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const slugBase = isNonEmptyString(data?.slug)
      ? slugify(String(data.slug))
      : slugify(title)

    let slug = await generateUniqueSlug(slugBase)

    const citySlug = isNonEmptyString(data?.citySlug)
      ? String(data.citySlug).trim()
      : String(city)

    const neighborhood = isNonEmptyString(data?.neighborhood)
      ? String(data.neighborhood).trim()
      : DEFAULT_NEIGHBORHOOD

    const shortDescription = isNonEmptyString(data?.shortDescription)
      ? String(data.shortDescription).trim()
      : buildShortDescription({ title, city: String(city) })

    const longDescription = isNonEmptyString(data?.longDescription)
      ? String(data.longDescription).trim()
      : shortDescription

    const totalAreaNumber =
      data?.totalArea === undefined || data?.totalArea === null
        ? DEFAULT_TOTAL_AREA
        : Number(data?.totalArea)

    const totalArea = Number.isFinite(totalAreaNumber)
      ? Math.max(DEFAULT_TOTAL_AREA, totalAreaNumber)
      : DEFAULT_TOTAL_AREA

    const coverImageUrl = isNonEmptyString(data?.coverImageUrl)
      ? String(data.coverImageUrl).trim()
      : DEFAULT_COVER_IMAGE_URL

    const whatsappMessage = isNonEmptyString(data?.whatsappMessage)
      ? String(data.whatsappMessage).trim()
      : buildDefaultWhatsappMessage({ title, slug, siteUrl })

    if (data?.status && !isValidEnumValue(PropertyStatus, data.status)) {
      return NextResponse.json(
        { error: "Status inválido." },
        { status: 400 }
      );
    }

    const normalizedImages = normalizeImages(data.images)

    // Double-check: caso aconteça colisão inesperada, não quebra a importação em lote.
    const existing = await prisma.property.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (existing) {
      slug = await generateUniqueSlug(`${slugBase}-${Date.now()}`)
    }

    const property = await prisma.property.create({
      data: {
        slug,
        title,
        purpose,
        type,
        city,
        citySlug,
        neighborhood,
        price: priceNumber,
        priceSuffix: data?.priceSuffix ?? null,
        priceNote: data?.priceNote ?? null,
        shortDescription,
        longDescription,
        bedrooms: data?.bedrooms ?? null,
        bathrooms: data?.bathrooms ?? null,
        parkingSpaces: data?.parkingSpaces ?? null,
        totalArea,
        builtArea: data?.builtArea ?? null,
        coverImageUrl,
        featured: data?.featured ?? false,
        specialOpportunity: data?.specialOpportunity ?? false,
        tags: Array.isArray(data?.tags) ? data.tags : [],
        status: data?.status ?? PropertyStatus.disponivel,
        whatsappMessage,
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

    // Move images from temp to final location
    if (property.images && property.images.length > 0) {
      const updatedImages = await Promise.all(
        property.images.map(async (img, index) => {
          const tempId = extractTempIdFromUrl(img.src);
          if (!tempId) return img; // Not a temp image

          const fromPath = generateTempPath(img.src.split('/').pop() || '', tempId);
          const toPath = generateFinalPath(img.src.split('/').pop() || '', property.id);

          try {
            const finalUrl = await moveObject(fromPath, toPath);
            // Update the image in the database
            await prisma.propertyImage.update({
              where: { id: img.id },
              data: { src: finalUrl },
            });
            return { ...img, src: finalUrl };
          } catch (err) {
            console.error('Failed to move image:', err);
            return img;
          }
        })
      );

      // Reload property with updated images
      const updatedProperty = await prisma.property.findUnique({
        where: { id: property.id },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      if (updatedProperty) {
        return NextResponse.json(
          { property: serializeProperty(updatedProperty) },
          { status: 201 }
        );
      }
    }

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
