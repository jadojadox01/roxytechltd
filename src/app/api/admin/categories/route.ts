import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";


export async function GET() {

  const categories =
    await prismaClientInstance.category.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

  return NextResponse.json(categories);

}



export async function POST(req: Request) {

  try {

    const session =
      await getServerSession(authOptions);


    if (!session?.user || session.user.role !== "ADMIN") {

      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 403,
        }
      );

    }


    const formData = await req.formData();


    const title =
      formData.get("title")?.toString() || "";


    const slug =
      formData.get("slug")?.toString() || "";


    const description =
      formData.get("description")?.toString() || null;



    let imagePath: string | null = null;



    const imageFile = formData.get("image");



    if (imageFile && imageFile instanceof File) {


      const buffer =
        Buffer.from(
          await imageFile.arrayBuffer()
        );


      const uploadResult =
        await new Promise<any>((resolve, reject) => {


          cloudinary.uploader.upload_stream(

            {
              folder: "categories",
            },


            (error, result) => {

              if (error) {

                reject(error);

              } else {

                resolve(result);

              }

            }

          ).end(buffer);


        });



      imagePath =
        uploadResult.secure_url;


    }



    if (!title || !slug) {

      return NextResponse.json(
        {
          error: "Missing title or slug",
        },
        {
          status: 400,
        }
      );

    }



    const category =
      await prismaClientInstance.category.create({

        data: {

          title,

          slug,

          image: imagePath,

          description,

        },

      });



    revalidateTag("categories", "max");

    revalidateTag("products", "max");


    return NextResponse.json(category);



  } catch (error:any) {


    console.error(
      "CATEGORY CREATE ERROR:",
      error
    );


    return NextResponse.json(

      {
        error:
          error.message ||
          "Failed to create category",
      },

      {
        status:500,
      }

    );

  }

}