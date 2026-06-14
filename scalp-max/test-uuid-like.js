const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oiydpevjgdopzzfqzbkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9peWRwZXZqZ2RvcHp6ZnF6YmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNjE0MDgsImV4cCI6MjA5NjYzNzQwOH0.Rx1gWRDji0OVT7JvGIEwYRLKyhGmY9fYYAUrxBG6zWg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing .like() query on UUID column...");
  // Let's use the last 8 chars of one of the existing UUIDs: c1b14a03-c9c3-420d-9cd1-75c6dce4cf11
  // Suffix is 75c6dce4cf11 or just 7c6dce4cf11? Wait, last 8 chars of UUID:
  // "c1b14a03-c9c3-420d-9cd1-75c6dce4cf11" -> "dce4cf11"
  const hexId = "dce4cf11";

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .like('id', `%${hexId}`);

  if (error) {
    console.error("Error doing .like() on UUID column:", error);
  } else {
    console.log("Success! Data:", data);
  }
}

test();
