import { SignIn } from "@clerk/nextjs";
import { cookies } from "next/headers";

export default async function Page() {
    (await cookies()).delete('site_access_token');
    (await cookies()).delete('site_access'); // Clear grandfathered cookie if exists

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <SignIn />
        </div>
    );
}
