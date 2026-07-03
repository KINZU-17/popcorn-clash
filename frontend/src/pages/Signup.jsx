// import React from 'react';

const SignupPage = () => {
  return (
    <div className="flex min-h-screen w-full font-sans antialiased text-zinc-950 bg-white">
      {/* Left Side: Branding & Background Video (Hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between p-12 text-white lg:flex overflow-hidden">
        
        {/* Background Video Element */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 h-full w-full object-cover z-0 brightness-[0.4]"
        >
          /* Replace this URL with your actual streaming video link */.
           <source src="/frontend/public/127841-739487655_medium.mp4" type="video/mp4" />
          Your browser does not support the video tag. 
        </video>

        {/* Foreground Content wrapper - z-10 keeps it above the video */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 text-lg font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-zinc-950">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" /></svg>
            </div>
            PopcornClash
          </div>

          {/* Quote */}
          <div className="max-w-md">
            <blockquote className="space-y-4">
              <p className="text-lg font-light leading-relaxed">
                "Joining PopcornClash has been the best decision for our engineering team. The speed of deployment and the quality of the built-in components are world-class."
              </p>
              <footer className="text-sm">
                <cite className="not-italic font-medium">Alex Rivera</cite>
                <p className="text-zinc-300">CTO at SyncLabs</p>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-[360px] space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-zinc-500">Enter your details below to get started</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="full-name">
                  Full Name
                </label>
                <input
                  id="full-name"
                  type="text"
                  placeholder="John Doe"
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <button className="inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2">
                Create Account
              </button>
            </div>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-zinc-500">Or sign up with</span>
              </div>
            </div>

            {/* Social Login */}
            <button className="inline-flex h-10 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-950 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>

          {/* Footer Links */}
          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <a href="#" className="font-medium text-zinc-950 underline underline-offset-4">
              Login
            </a>
          </p>
          
          <div className="text-center text-[12px] leading-relaxed text-zinc-400">
            By creating an account, you agree to our{" "}
            <a href="#" className="underline hover:text-zinc-950">Terms of Service</a> and{" "}
            <a href="#" className="underline hover:text-zinc-950">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
