import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";


// GET SETTINGS
// Public access (homepage/footer/about page need this)
export async function GET() {
  try {

    let settings = await prisma.siteSetting.findFirst();


    if (!settings) {

      settings = await prisma.siteSetting.create({
        data: {
          currency: "RWF",
        },
      });

    }


    return NextResponse.json({
      success: true,
      settings,
    });


  } catch (error: any) {

    console.error(
      "GET SITE SETTINGS ERROR:",
      error
    );


    return NextResponse.json(
      {
        success:false,
        message:error.message || "Failed to fetch settings",
      },
      {
        status:500,
      }
    );

  }
}





// UPDATE SETTINGS
// Admin only
export async function PUT(
  request: NextRequest
) {

  try {


    const session =
      await getServerSession(authOptions);



    if (
      !session?.user ||
      session.user.role !== "ADMIN"
    ) {

      return NextResponse.json(
        {
          success:false,
          message:"Access denied",
        },
        {
          status:403,
        }
      );

    }



    const body =
      await request.json();



    const {

      about,
      mission,
      vision,

      contactPhone,
      contactEmail,
      contactAddress,

      facebookUrl,
      twitterUrl,
      instagramUrl,
      linkedinUrl,

      currency,


    } = body;




    let settings =
      await prisma.siteSetting.findFirst();




    if (!settings) {


      settings =
        await prisma.siteSetting.create({

          data:{

            about,
            mission,
            vision,

            contactPhone,
            contactEmail,
            contactAddress,

            facebookUrl,
            twitterUrl,
            instagramUrl,
            linkedinUrl,

            currency:
              currency || "RWF",

          }

        });



    } else {



      settings =
        await prisma.siteSetting.update({

          where:{
            id:settings.id,
          },


          data:{


            about,
            mission,
            vision,

            contactPhone,
            contactEmail,
            contactAddress,

            facebookUrl,
            twitterUrl,
            instagramUrl,
            linkedinUrl,


            currency:
              currency || "RWF",


          }


        });



    }



    // refresh website data
    revalidateTag(
      "site-settings"
    );



    return NextResponse.json({

      success:true,
      settings,

    });



  } catch(error:any){


    console.error(
      "UPDATE SITE SETTINGS ERROR:",
      error
    );


    return NextResponse.json(
      {
        success:false,
        message:
          error.message ||
          "Failed to update settings",
      },
      {
        status:500,
      }
    );


  }

}