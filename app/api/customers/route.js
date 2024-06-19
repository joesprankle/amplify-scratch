// app/api/customers/route.js

export async function POST(request) {
    const { name, email, SID } = await request.json();
    // Here you would normally handle the data, e.g., save it to a database
    return new Response(JSON.stringify({ message: 'Customer data received', data: { name, email, SID } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  export async function GET(request) {
    // Handle GET requests if needed
    return new Response(JSON.stringify({ message: 'GET request received' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }