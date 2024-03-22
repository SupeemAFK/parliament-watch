import { safeFind } from '$lib/datasheets/processor';
import type { Assembly } from './assembly';
import type { Link } from './link';
import type { Politician } from './politician';
import { z } from 'zod';

export enum BillStatus {
	InProgress = 'กำลังดำเนินการ',
	Enacted = 'ออกเป็นกฎหมาย',
	Rejected = 'ตกไป',
	Merged = 'ถูกรวมร่าง'
}

export enum BillProposerType {
	Politician = 'สมาชิกรัฐสภา',
	Cabinet = 'คณะรัฐมนตรี',
	People = 'ประชาชน'
}

export interface PeopleProposer {
	ledBy: string;
	signatoryCount: number;
}

export type CabinetId = number;

export const createBillSchema = (politicians: Politician[], assemblies: Assembly[]) =>
	z
		.object({
			id: z.string(),
			acceptanceNumber: z.string(),
			title: z.string(),
			// TODO: No nickname in sheet yet
			nickname: z.string().default('no nickname'),
			description: z.string().optional(),
			status: z.nativeEnum(BillStatus),
			categories: z.string().optional(),
			proposedOn: z.date(),
			attachmentName: z.string().optional(),
			attachmentUrl: z.string().optional(),
			proposedLedByPoliticianId: z.string().optional(),
			coProposedByPoliticians: z.string().optional(),
			proposedByAssemblyId: z.string().optional(),
			proposedLedByPeople: z.string().optional(),
			peopleSignatureCount: z.number().optional(),
			lisUrl: z.string()
		})
		.transform(
			({
				categories,
				attachmentName,
				attachmentUrl,
				proposedLedByPoliticianId,
				coProposedByPoliticians,
				proposedByAssemblyId,
				proposedLedByPeople,
				peopleSignatureCount,
				...rest
			}) => ({
				...rest,
				categories: categories?.split(',').map((c) => c.trim()) || [ // TODO: Mock category while datasheet is not ready
					['ขนส่งสาธารณะ', 'เศรษฐกิจ', 'แก้รัฐธรรมนูญ', 'วัฒนธรรม', 'เกษตรกรรม'][
						Math.floor(Math.random() * 5)
					]
				],
				attachment:
					attachmentName && attachmentUrl
						? ({ label: attachmentName, url: attachmentUrl } as Link)
						: undefined,
				proposerType: proposedLedByPoliticianId
					? BillProposerType.Politician
					: proposedByAssemblyId
						? BillProposerType.Cabinet
						: BillProposerType.People,
				proposedLedByPolitician: proposedLedByPoliticianId
					? politicians.find(({ id }) => id === proposedLedByPoliticianId)
					: undefined,
				coProposedByPoliticians: coProposedByPoliticians?.split(',').map((name) => name.trim()),
				proposedByAssembly: proposedByAssemblyId
					? safeFind(assemblies, ({ id }) => id === proposedByAssemblyId)
					: undefined,
				proposedByPeople:
					proposedLedByPeople && peopleSignatureCount
						? ({
								ledBy: proposedLedByPeople,
								signatoryCount: peopleSignatureCount
							} as PeopleProposer)
						: undefined
			})
		);

export type Bill = z.infer<ReturnType<typeof createBillSchema>>;
