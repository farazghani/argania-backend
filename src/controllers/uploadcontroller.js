import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../services/supabaseclient.js";

export const uploadProductImage = async (req, res) => {
  try {
    const file = req.file;   // multer

    if (!file) return res.status(400).json({ error: "No file" });

    const key = `${crypto.randomUUID()}-${file.originalname}`;
    console.log("its here ");
    const data = await client.send(
                                new PutObjectCommand({
                                    Bucket: "products",
                                    Key: key,
                                    Body: file.buffer,
                                    ContentType: file.mimetype,
                                    CacheControl: "public,max-age=31536000",
                                })
                                );

    console.log(data);

    res.json({
      url: `${process.env.SUPABASE_IMG_URL}/${key}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

//https://bbvmrqpwhiiotjezedne.supabase.co/storage/v1/object/public/products/2317fe26-d189-491c-9b3b-722b02c7010a-1718244890260.jpeg