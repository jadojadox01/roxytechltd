import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await prismaClientInstance.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        category: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(products);

  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {

  try {

    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }


    const contentType = req.headers.get("content-type") || "";


    let title = "";
    let slug = "";
    let price: string | number | null = null;
    let discountedPrice: string | number | null = null;
    let quantity = 10;
    let categoryId: string | null = null;
    let description: string | null = null;
    let shortDescription: string | null = null;
    let isNewArrival = false;
    let uploadedImages: string[] = [];



    if (contentType.includes("multipart/form-data")) {


      const formData = await req.formData();


      title = formData.get("title")?.toString() || "";
      slug = formData.get("slug")?.toString() || "";

      price = formData.get("price")?.toString() || null;

      discountedPrice =
        formData.get("discountedPrice")?.toString() || null;

      quantity =
        Number(formData.get("quantity")?.toString()) || 10;


      categoryId =
        formData.get("categoryId")?.toString() || null;


      description =
        formData.get("description")?.toString() || null;


      shortDescription =
        formData.get("shortDescription")?.toString() || null;


      isNewArrival =
        formData.get("isNewArrival")?.toString() === "true";



      const files = formData
        .getAll("images")
        .filter((file): file is File => file instanceof File);



      for (const file of files) {


        const buffer = Buffer.from(
          await file.arrayBuffer()
        );


        const uploaded = await new Promise<any>(
          (resolve, reject) => {


            cloudinary.uploader.upload_stream(
              {
                folder: "products",
              },

              (error, result) => {

                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }

              }

            ).end(buffer);


          }
        );


        uploadedImages.push(
          uploaded.secure_url
        );


      }


    } else {


      const body = await req.json();


      title = body.title || "";
      slug = body.slug || "";

      price = body.price ?? null;

      discountedPrice =
        body.discountedPrice ?? null;

      quantity =
        Number(body.quantity) || 10;


      categoryId =
        body.categoryId ?? null;


      description =
        body.description ?? null;


      shortDescription =
        body.shortDescription ?? null;


      isNewArrival =
        body.isNewArrival === true ||
        body.isNewArrival === "true";


      uploadedImages =
        Array.isArray(body.images)
          ? body.images.filter(Boolean)
          : [];

    }



    title = title.trim();
    slug = slug.trim();


    description =
      description?.trim() || null;


    shortDescription =
      shortDescription?.trim() || null;



    if (!title) {

      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );

    }



    if (!slug) {

      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    }



    const parsedPrice = Number(price);



    if (Number.isNaN(parsedPrice)) {

      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );

    }



    const resolvedQuantity =
      Number.isFinite(quantity) && quantity > 0
        ? quantity
        : 10;



    const variantImages =
      uploadedImages.length > 0
        ? uploadedImages
        : [
            "/images/products/product-placeholder.png",
          ];




    const product =
      await prismaClientInstance.product.create({

        data: {

          title,

          slug,

          price: String(parsedPrice),

          discountedPrice:
            discountedPrice !== null
              ? String(discountedPrice)
              : null,


          quantity: resolvedQuantity,


          categoryId,


          description,


          shortDescription,


          isNewArrival,


          images: uploadedImages,


          productVariants: {

            create: variantImages.map(
              (image, index) => ({

                image,

                color: null,

                size: null,

                isDefault: index === 0,

              })
            ),

          },


        },

      });



    revalidateTag("products", "max");



    return NextResponse.json(product);



  } catch (error:any) {


    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );


    return NextResponse.json(

      {
        error:
          error.message ||
          "Failed to create product",
      },

      {
        status:500,
      }

    );


  }

}