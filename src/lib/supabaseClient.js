import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ypbefchuqpfqodahwinu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYmVmY2h1cXBmcW9kYWh3aW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2MDA2MTUsImV4cCI6MjA0MzE3NjYxNX0.FXroDh3JpnMrLt1w7Jr1yUmlSx6T7yakjsxHseGW60g"
);
