import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    // 1. Basic Security Check (Optional but recommended)
    // You can append ?secret=YOUR_SECRET to the webhook URL in Lynk.id
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const expectedSecret = process.env.PRODUCT_WEBHOOK_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Webhook Payload
    const body = await req.json();
    console.log("Webhook payload received:", body);

    // Lynk.id payload schema might vary (can be flat or nested under data.message_data)
    const msgData = body.data?.message_data || body;
    const customer = msgData.customer || {};
    const items = msgData.items || [];

    const email = msgData.buyer_email || msgData.email || customer.email || body.buyer_email || body.email || body.customer?.email;
    const name = msgData.buyer_name || msgData.name || customer.name || body.buyer_name || body.name || body.customer?.name || "Member";
    
    let productName = msgData.product_name || msgData.item_name || body.product_name || body.item_name || "";
    
    if (!productName && Array.isArray(items) && items.length > 0) {
      // Find the first item name
      productName = items[0].name || items[0].product_name || items[0].item_name || "";
    }

    if (!email) {
      return NextResponse.json({ error: "No email provided in payload" }, { status: 400 });
    }

    // 2.5 Filter Produk (Agar tidak semua produk Lynk.id membuka akses ke sini)
    const allowedProducts = ["PromptVault OS"];
    
    // Check if the main product name or any items match the keyword
    let isAllowedProduct = false;
    if (productName && allowedProducts.some((allowedKeyword) => productName.toLowerCase().includes(allowedKeyword.toLowerCase()))) {
      isAllowedProduct = true;
    } else if (Array.isArray(items)) {
      isAllowedProduct = items.some((item: any) => {
        const nameToCheck = item.name || item.product_name || item.item_name || "";
        return allowedProducts.some((allowedKeyword) => nameToCheck.toLowerCase().includes(allowedKeyword.toLowerCase()));
      });

      // If matched, extract the matched product name
      if (isAllowedProduct && items.length > 0) {
        const matchedItem = items.find((item: any) => {
          const nameToCheck = item.name || item.product_name || item.item_name || "";
          return allowedProducts.some((allowedKeyword) => nameToCheck.toLowerCase().includes(allowedKeyword.toLowerCase()));
        });
        if (matchedItem) {
          productName = matchedItem.name || matchedItem.product_name || matchedItem.item_name || productName;
        }
      }
    }

    if (!productName) {
      productName = "PromptVault Access";
    }

    if (!isAllowedProduct) {
      console.log(`Webhook diabaikan. Produk "${productName}" tidak termasuk produk yang memberi akses.`);
      return NextResponse.json({ message: "Ignored: Product does not grant access" });
    }

    // 3. Auto-Create Supabase User
    // We use a default password. The user should be instructed to use this via Lynk.id thank you page.
    const defaultPassword = "Prompt2024!";
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: defaultPassword,
      email_confirm: true, // Bypass Gmail confirmation!
      user_metadata: {
        full_name: name,
      },
    });

    let userId = authData?.user?.id;

    if (authError) {
      // If user already exists, Supabase throws an error (e.g., status 422 with message containing "already exists")
      // In this case, we don't need to create the user again. They can just login with their existing password.
      console.log(`User creation skipped or failed for ${email}:`, authError.message);
      
      // Attempt to look up existing user ID from profiles table
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();
        
      if (profile) {
        userId = profile.id;
      }
    }

    // 4. Grant Access to Database
    const { error: grantError } = await supabaseAdmin
      .from("access_grants")
      .insert({
        email: email,
        full_name: name,
        provider: "lynk_id",
        product_id: productName,
        status: "granted",
        granted_user_id: userId || null,
        metadata: body, // Save the full payload for debugging/records
      });

    if (grantError) {
      console.error("Failed to grant access:", grantError);
      return NextResponse.json({ error: "Failed to save access grant" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Access granted automatically" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
