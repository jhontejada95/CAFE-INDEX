// src/mappings.ts
import { SubstrateEvent } from "@subql/types";
import { Price } from "./types/models/Price";

export async function handlePriceSet(event: SubstrateEvent): Promise<void> {
  const {
    event: { data: [_who, price] },
    block
  } = event;

  const blockNumber = block.block.header.number.toBigInt();
  const timestamp = blockNumber;
  const id = blockNumber.toString();

  const record = new Price(
    id,
    blockNumber,
    (price as any).toNumber(),
    timestamp
  );

  await record.save();
}
