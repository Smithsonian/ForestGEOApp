// DOWNLOAD ALL FILES ROUTE HANDLER
import {NextRequest, NextResponse} from "next/server";
import {getContainerClient} from "@/config/macros";


export async function GET(request: NextRequest, response: NextResponse) {
  const plot = request.nextUrl.searchParams.get('plot')!.trim();
  const census = request.nextUrl.searchParams.get('census')!.trim();
  const blobData: any = [];
  const containerClient = await getContainerClient(`${plot}-${census}`);
  if (!containerClient) {
    return NextResponse.json({statusText: "Container client creation error"}, {status: 400});
  } else {
    console.log(`container client created`);
  }
  const listOptions = {
    includeMetadata: true,
    includeVersions: false,
  };
  let i = 0;
  try {
    for await (const blob of containerClient.listBlobsFlat(listOptions)) {
      if (!blob) console.error('blob is undefined');
      // blobData.push({ key: i.toString(), filename: blob.name, metadata: blob.metadata! });
      blobData.push(
        {
          key: ++i,
          name: blob.name,
          user: blob.metadata?.user,
          formType: blob.metadata?.FormType,
          fileErrors: JSON.parse(<string>blob.metadata?.FileErrorState),
          date: blob.properties.lastModified
        });
    }
    return new NextResponse(
      JSON.stringify({
        responseMessage: "List of files",
        blobData: blobData,
      }),
      {status: 200}
    );
  } catch (error: any) {
    console.error('error in blob listing: ', error);
    return NextResponse.json({message: error.message}, {status: 400});
  }
}
