import type { RequestHandler } from "express";
import { parseId } from "../../utils/http";
import * as feesService from "./fees.service";
import type {
  FeeCollectionInput,
  FeeHeadInput,
  FeeStructureInput,
} from "./fees.service";

type Service<CreateInput extends object, UpdateInput extends object> = {
  list: (
    page: number,
    limit: number,
  ) => Promise<{ data: unknown; pagination: unknown }>;
  get: (id: number) => Promise<unknown>;
  create: (input: CreateInput) => Promise<unknown>;
  update: (id: number, input: UpdateInput) => Promise<unknown>;
  remove: (id: number) => Promise<unknown>;
};
const page = (value: unknown, fallback: number, max: number) => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0
    ? Math.min(parsed, max)
    : fallback;
};
const handlers = <CreateInput extends object, UpdateInput extends object>(
  service: Service<CreateInput, UpdateInput>,
  label: string,
) => ({
  list: (async (req, res) => {
    const result = await service.list(
      page(req.query.page, 1, Number.MAX_SAFE_INTEGER),
      page(req.query.limit, 20, 100),
    );
    res.json({ success: true, ...result });
  }) as RequestHandler,
  get: (async (req, res) =>
    res.json({
      success: true,
      data: await service.get(parseId(String(req.params.id))),
    })) as RequestHandler,
  create: (async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        data: await service.create(req.body as CreateInput),
      })) as RequestHandler,
  update: (async (req, res) =>
    res.json({
      success: true,
      data: await service.update(
        parseId(String(req.params.id)),
        req.body as UpdateInput,
      ),
    })) as RequestHandler,
  remove: (async (req, res) =>
    res.json({
      success: true,
      message: `${label} deleted`,
      data: await service.remove(parseId(String(req.params.id))),
    })) as RequestHandler,
});

export const feeHeadsController = handlers<FeeHeadInput, Partial<FeeHeadInput>>(
  {
    list: feesService.listFeeHeads,
    get: feesService.getFeeHead,
    create: feesService.createFeeHead,
    update: feesService.updateFeeHead,
    remove: feesService.deleteFeeHead,
  },
  "Fee head",
);
export const feeStructuresController = handlers<
  FeeStructureInput,
  Partial<FeeStructureInput>
>(
  {
    list: feesService.listFeeStructures,
    get: feesService.getFeeStructure,
    create: feesService.createFeeStructure,
    update: feesService.updateFeeStructure,
    remove: feesService.deleteFeeStructure,
  },
  "Fee structure",
);
export const feeCollectionsController = {
  list: (async (req, res) => {
    const result = await feesService.listFeeCollections(
      page(req.query.page, 1, Number.MAX_SAFE_INTEGER),
      page(req.query.limit, 20, 100),
    );
    res.json({ success: true, ...result });
  }) as RequestHandler,
  get: (async (req, res) => {
    res.json({
      success: true,
      data: await feesService.getFeeCollection(parseId(String(req.params.id))),
    });
  }) as RequestHandler,
  create: (async (req, res) => {
    const data = await feesService.createFeeCollection(
      req.body as FeeCollectionInput,
      req.user!.id,
    );
    res.status(201).json({ success: true, data });
  }) as RequestHandler,
  update: (async (req, res) => {
    const data = await feesService.updateFeeCollection(
      parseId(String(req.params.id)),
      req.body,
    );
    res.json({ success: true, data });
  }) as RequestHandler,
  remove: (async (req, res) => {
    const data = await feesService.deleteFeeCollection(
      parseId(String(req.params.id)),
    );
    res.json({ success: true, message: "Fee collection deleted", data });
  }) as RequestHandler,
};

export const searchStudents: RequestHandler = async (req, res) => {
  const data = await feesService.searchStudentsForFees(
    String(req.query.q ?? ""),
  );
  res.json({ success: true, data });
};
export const studentDue: RequestHandler = async (req, res) => {
  const studentId = parseId(String(req.params.studentId));
  const academicYearId = parseId(String(req.query.academicYearId));
  const data = await feesService.getStudentFeeDue(studentId, academicYearId);
  res.json({ success: true, data });
};
