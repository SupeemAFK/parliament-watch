import type { RelatedVotingResults } from '$components/bills/Progress.svelte';
import { fetchFromIdOr404, fetchBills, fetchBillEvents } from '$lib/datasheets';
import { createSeo } from '$lib/seo';
import type { Bill } from '$models/bill';
import type { BillEvent } from '$models/bill-event';

export async function load({ params }) {
	const bill = await fetchFromIdOr404(fetchBills, params.id);
	const events = (await fetchBillEvents())
		.filter(({ billId }) => billId === bill.id)
		.sort((a, z) => z.date.getTime() - a.date.getTime());

	return {
		bill,
		// TODO: merged bill and event data is not ready yet
		mergedBills: [] as Bill[], // Bills that got merged into this bill.
		events,
		mergedIntoBill: undefined as Bill | undefined, // The bill that this bill got merged into. (merged event)
		mergedIntoBillLatestEvent: undefined as BillEvent | undefined,
		relatedVotingResults: {} as RelatedVotingResults, // Info of votings in events
		seo: createSeo({
			title: bill.nickname
		})
	};
}
