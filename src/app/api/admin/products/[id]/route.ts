import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";
import { promises as fs } from "fs";
import path from "path";


export const runtime = "nodejs";



// ==========================
// GET SINGLE PRODUCT
// ==========================

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id:string }> }
){

  try {

    const {id} = await params;


    const product =
      await prismaClientInstance.product.findUnique({

        where:{
          id
        },

        include:{
          category:true,
          productVariants:true,
          reviews:true
        }

      });



    if(!product){

      return NextResponse.json(
        {
          error:"Product not found"
        },
        {
          status:404
        }
      );

    }



    return NextResponse.json(product);



  }catch(error){

    console.error(
      "GET PRODUCT ERROR",
      error
    );


    return NextResponse.json(
      {
        error:"Failed fetching product"
      },
      {
        status:500
      }
    );

  }

}








// ==========================
// UPDATE PRODUCT
// ==========================

export async function PATCH(
  req:Request,
  {params}:{params:Promise<{id:string}>}
){


try{


const session =
await getServerSession(authOptions);



if(!session?.user || session.user.role !== "ADMIN"){

return NextResponse.json(
{
error:"Unauthorized"
},
{
status:403
}
);

}



const {id}=await params;



const contentType =
req.headers.get("content-type") || "";



let updateData:any={};




// ==========================
// FORM DATA (WITH IMAGES)
// ==========================


if(contentType.includes("multipart/form-data")){


const formData =
await req.formData();



updateData.title =
formData.get("title")?.toString();



updateData.slug =
formData.get("slug")?.toString();



updateData.price =
formData.get("price")?.toString();



updateData.discountedPrice =
formData.get("discountedPrice")
?.toString() || null;



updateData.quantity =
Number(
formData.get("quantity") || 0
);



updateData.categoryId =
formData.get("categoryId")
?.toString() || null;



updateData.description =
formData.get("description")
?.toString() || null;



updateData.shortDescription =
formData.get("shortDescription")
?.toString() || null;



updateData.isNewArrival =
formData.get("isNewArrival")
==="true";




// IMAGE UPLOAD

const files =
formData
.getAll("images")
.filter(
(file):file is File =>
file instanceof File &&
file.size > 0
);



if(files.length){


const uploadedImages:string[]=[];


const uploadDir =
path.join(
process.cwd(),
"public/uploads/products"
);



await fs.mkdir(
uploadDir,
{
recursive:true
}
);



for(const file of files){


const filename =
`${Date.now()}-${file.name.replace(/\s+/g,"-")}`;



const filePath =
path.join(
uploadDir,
filename
);



const buffer =
Buffer.from(
await file.arrayBuffer()
);



await fs.writeFile(
filePath,
buffer
);



uploadedImages.push(
`/uploads/products/${filename}`
);


}



updateData.images =
uploadedImages;


}




}




// ==========================
// JSON UPDATE
// ==========================


else{


updateData =
await req.json();


}






const updated =
await prismaClientInstance.product.update({

where:{
id
},


data:{



...(updateData.title && {

title:updateData.title

}),




...(updateData.slug && {

slug:updateData.slug

}),




...(updateData.price !== undefined && {

price:String(updateData.price)

}),




...(updateData.discountedPrice !== undefined && {

discountedPrice:
updateData.discountedPrice
? String(updateData.discountedPrice)
:null

}),




...(updateData.quantity !== undefined && {

quantity:Number(updateData.quantity)

}),




...(updateData.categoryId !== undefined && {

categoryId:updateData.categoryId

}),




...(updateData.description !== undefined && {

description:updateData.description

}),




...(updateData.shortDescription !== undefined && {

shortDescription:updateData.shortDescription

}),




...(updateData.isNewArrival !== undefined && {

isNewArrival:updateData.isNewArrival

}),




...(updateData.images && {

images:updateData.images

})



}


});





// Update variants if images changed

if(updateData.images){


await prismaClientInstance.productVariant.deleteMany({

where:{
productId:id
}

});



await prismaClientInstance.productVariant.createMany({

data:
updateData.images.map(
(image:string,index:number)=>({

productId:id,

image,

color:null,

size:null,

isDefault:index===0

})
)

});


}




revalidateTag(
"products",
"max"
);



return NextResponse.json(updated);



}catch(error:any){


console.error(
"UPDATE PRODUCT ERROR",
error
);



return NextResponse.json(

{
error:
error.message ||
"Update failed"
},

{
status:500
}

);


}


}









// ==========================
// DELETE PRODUCT
// ==========================


export async function DELETE(
 _req:Request,
 {params}:{params:Promise<{id:string}>}
){


try{


const session =
await getServerSession(authOptions);



if(!session?.user || session.user.role !== "ADMIN"){


return NextResponse.json(
{
error:"Unauthorized"
},
{
status:403
}
);


}



const {id}=await params;



const product =
await prismaClientInstance.product.findUnique({

where:{
id
}

});



if(!product){


return NextResponse.json(
{
error:"Product not found"
},
{
status:404
}
);


}






await prismaClientInstance.$transaction(
async(tx)=>{


// remove variants

await tx.productVariant.deleteMany({

where:{
productId:id
}

});



// remove reviews

await tx.review.deleteMany({

where:{
productSlug:product.slug
}

});



// remove other relations if existing

await tx.heroBanner.deleteMany({

where:{
productId:id
}

});


await tx.heroSlider.deleteMany({

where:{
productId:id
}

});


await tx.countdown.deleteMany({

where:{
productId:id
}

});


await tx.additionalInformation.deleteMany({

where:{
productId:id
}

});



await tx.product.delete({

where:{
id
}

});


}

);





revalidateTag(
"products",
"max"
);



return NextResponse.json(
{
message:"Product deleted successfully"
}
);



}catch(error:any){


console.error(
"DELETE PRODUCT ERROR",
error
);



return NextResponse.json(
{
error:
error.message ||
"Delete failed"
},
{
status:500
}
);


}


}