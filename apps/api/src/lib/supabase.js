import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error("Missing SUPABASE_URL (check apps/api/.env and where you run node)");
if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (check apps/api/.env)");

export const supabase = createClient(url, key);
