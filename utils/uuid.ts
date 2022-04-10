import crypto from "crypto"

export default function uuid(size: number) {
  const id = crypto.randomBytes(size / 2)

  return id.toString("hex")
}
