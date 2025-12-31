import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SetupAdminRequest {
  setup_code: string;
  user_id: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { setup_code, user_id }: SetupAdminRequest = await req.json();
    
    console.log("Setup admin request received for user:", user_id);

    // Verify the setup code
    const expectedCode = Deno.env.get("ADMIN_SETUP_CODE");
    if (!expectedCode) {
      console.error("ADMIN_SETUP_CODE not configured");
      return new Response(
        JSON.stringify({ error: "Admin setup not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (setup_code !== expectedCode) {
      console.log("Invalid setup code provided");
      return new Response(
        JSON.stringify({ error: "Invalid setup code" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if user already has admin role
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .eq("user_id", user_id)
      .eq("role", "admin")
      .maybeSingle();

    if (existingRole) {
      console.log("User already has admin role");
      return new Response(
        JSON.stringify({ message: "You already have admin access", success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Add admin role to user
    const { error: insertError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id, role: "admin" });

    if (insertError) {
      console.error("Error inserting admin role:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to grant admin access" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Admin role granted successfully to user:", user_id);

    return new Response(
      JSON.stringify({ message: "Admin access granted successfully!", success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in setup-admin function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
