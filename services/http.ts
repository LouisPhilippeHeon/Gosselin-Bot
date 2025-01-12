import axios from "axios";
import { UsedItem } from "../models/used-item";

const gosselinUrl = "https://gosselinphoto.ca";
const endpoint = `${gosselinUrl}/graphql?query=query+GetUsedEquipment($pageSize%3AInt!$currentPage%3AInt!$uid%3AString!){products(pageSize%3A$pageSize+currentPage%3A$currentPage+filter%3A{category_uid%3A{eq%3A$uid}}){items{id+name+price_range{minimum_price{regular_price{value}}}+url_key}page_info{total_pages}+total_count}}&variables={%22pageSize%22:1000,%22currentPage%22:1,%22uid%22:%22MTE2%22}`;

export async function fetchUsedItems(): Promise<UsedItem[]> {
	const fetchedEquipement: UsedItem[] = [];

	try {
		const response = await axios.get(endpoint);
		fetchedEquipement.push(...response.data.data.products.items.map((item: any) => mapApiResponseToUsedItem(item)));
	} catch (error) {
		console.error("Impossible d'obtenir l'équipement usagé.", error);
	}

	return fetchedEquipement;
}
  
function mapApiResponseToUsedItem(apiResponse: any): UsedItem {
	return {
		id: apiResponse.id,
		name: apiResponse.name,
		price: apiResponse.price_range.minimum_price.regular_price.value,
		url: `${gosselinUrl}/${apiResponse.url_key}`,
	};
}