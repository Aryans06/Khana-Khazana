import { auth, currentUser } from "@clerk/nextjs/server"

const STRAPI_URL=process.env.NEXT_PUBLIC_STRAPI_URL||"http://localhost:1337";
const STRAPI_API_TOKEN=process.env.STRAPI_API_TOKEN;

export const checkUser=async()=>{
  const user= await currentUser();
  
  if(!user){
    console.log("No user found");
    return null;
  }
  if(!STRAPI_API_TOKEN){
    console.log("No STRAPI_API_TOKEN found");
    return null;
  }

  const subscriptionTier="free";

  try {
    const existingUserResponse=await fetch(`${STRAPI_URL}/api/users?filters[clerkId][$eq]=${user.id}`,{
      headers:{
        Authorization:`Bearer ${STRAPI_API_TOKEN}`
      },
      cache:"no-store"
    });
    if(!existingUserResponse.ok){
        const errorText=await existingUserResponse.text();
        console.log("Error fetching user from Strapi:", errorText);
         return null;
    }
       const existingUserData=await existingUserResponse.json();
         if(existingUserData?.data?.length>0){  
            const existingUser=existingUserData.data[0];
            if(existingUser.susbcriptionTier!==subscriptionTier){
                await fetch(`${STRAPI_URL}/api/users/${existingUser.id}`,{
                    method:"PUT",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:`Bearer ${STRAPI_API_TOKEN}`
                    },
                    body:JSON.stringify({
                        subscriptionTier
                    })
                });
            }
            return {...existingUser,subscriptionTier}

         }  
         const rolesResponse=await fetch(
            `${STRAPI_URL}/api/users-permissions/roles`,{
                headers:{
                    Authorization:`Bearer ${STRAPI_API_TOKEN}`
                }
            }
         );
    if(!rolesResponse.ok){
        const errorText=await rolesResponse.text();
        console.log("Error fetching roles from Strapi:", errorText);
        return null;
    }
    const rolesData=await rolesResponse.json();
    console.log("Roles data received:", rolesData);
    const authenticatedRole=rolesData?.roles?.find(role=>role.name.toLowerCase()==="authenticated");    
    
    if(!authenticatedRole){
        console.log("Authenticated role not found in Strapi. Available roles:", rolesData);
        return null;
    }
    const userData={
        username:
        user.username||user.emailAddresses[0].emailAddress.split("@")[0],
        email:user.emailAddresses[0].emailAddress,
        password:`cler_managed_${user.id}_${Date.now()}`,
        confirmed:true,
        role:authenticatedRole.id,
        clerkId:user.id,
        subscriptionTier,
        firstName:user.firstName||"",
        lastName:user.lastName||"",
        imageUrl:user.imageUrl||"",
    }

    const newUserResponse=await fetch(`${STRAPI_URL}/api/users`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${STRAPI_API_TOKEN}`
        },
        body:JSON.stringify(userData)
    });
    if(!newUserResponse.ok){
        const errorText=await newUserResponse.text();
        console.log("Error creating user in Strapi:", errorText);
         return null;
    }
    const newUser=await newUserResponse.json();
    return newUser;
  } catch (error) {
    console.log("Error in checkUser function:", error);
    return null;
  }

}