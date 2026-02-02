import { SignIn } from "@clerk/nextjs";
import { ClearSession } from "@/components/auth/clear-session";

export default function Page() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <ClearSession />
            <SignIn />
        </div>
    );
}
