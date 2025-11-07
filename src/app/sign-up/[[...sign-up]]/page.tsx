import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Loginpage-background.png"
          alt="Sign Up Background"
          fill
          className="object-cover"
          priority
        />
        {/* Optional overlay for better readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Sign Up Container */}
      <div className="relative z-10 h-full flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
