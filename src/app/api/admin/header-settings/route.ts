import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { revalidateTag } from "next/cache";


export const runtime = "nodejs";


// GET SETTINGS
export async function GET(){

try{


const settings =
await prisma.headerSetting.findFirst();


return NextResponse.json({
success:true,
settings
});


}catch(error:any){

console.log(error);

return NextResponse.json(
{
success:false,
message:error.message
},
{
status:500
}
);

}

}





// UPDATE SETTINGS

export async function PUT(
request:NextRequest
){

try{


const session =
await getServerSession(authOptions);


if(!session?.user || session.user.role !== "ADMIN"){

return NextResponse.json(
{
message:"Unauthorized"
},
{
status:403
}
);

}



const formData =
await request.formData();



const siteName =
formData.get("siteName")?.toString();


const headerText =
formData.get("headerText")?.toString();



let logoUrl;



const logo =
formData.get("headerLogo");



if(
logo instanceof File &&
logo.size > 0
){



const buffer =
Buffer.from(
await logo.arrayBuffer()
);



const upload =
await new Promise<any>(
(resolve,reject)=>{


cloudinary.uploader.upload_stream(
{
folder:"roxytech/header"
},
(error,result)=>{

if(error)
reject(error);

else
resolve(result);

}
)
.end(buffer);



});


logoUrl =
upload.secure_url;


}





const old =
await prisma.headerSetting.findFirst();



const settings =
old

?

await prisma.headerSetting.update({

where:{
id:old.id
},

data:{

...(siteName && {
siteName
}),


...(headerText && {
headerText
}),


...(logoUrl && {
headerLogo:logoUrl
})


}

})


:


await prisma.headerSetting.create({

data:{

siteName,
headerText,
headerLogo:logoUrl

}

});



revalidateTag("header-setting");



return NextResponse.json({

success:true,
settings

});



}catch(error:any){


console.log(
"HEADER UPDATE ERROR:",
error
);



return NextResponse.json(
{
success:false,
message:error.message
},
{
status:500
}
);


}


}