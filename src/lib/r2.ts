import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID!,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
	},
});

export async function uploadFileToR2(
	file: File,
	folder: string = "surveys",
): Promise<string> {
	const bytes = await file.arrayBuffer();
	const buffer = Buffer.from(bytes);
	const extension = file.type.split("/")[1] || "bin";
	const filename = `${folder}/${crypto.randomUUID()}.${extension}`;

	try {
		console.log(
			`Uploading file ${filename} to bucket ${process.env.R2_BUCKET_NAME}`,
		);
		await r2Client.send(
			new PutObjectCommand({
				Bucket: process.env.R2_BUCKET_NAME!,
				Key: filename,
				Body: buffer,
				ContentType: file.type,
			}),
		);
		console.log(`Successfully uploaded ${filename}`);
	} catch (error) {
		console.error("Error uploading to R2:", error);
		throw error;
	}

	return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${filename}`;
}
