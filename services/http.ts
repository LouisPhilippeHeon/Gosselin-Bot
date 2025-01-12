import axios from 'axios';
import { Equipment } from '../models/equipment';

const gosselinUrl = 'https://gosselinphoto.ca';
const endpoint = `${gosselinUrl}/graphql?query=query+GetUsedEquipment($pageSize%3AInt!$currentPage%3AInt!$uid%3AString!){products(pageSize%3A$pageSize+currentPage%3A$currentPage+filter%3A{category_uid%3A{eq%3A$uid}}){items{id+name+price_range{minimum_price{regular_price{value}}}+url_key}page_info{total_pages}+total_count}}&variables={%22pageSize%22:1000,%22currentPage%22:1,%22uid%22:%22MTE2%22}`;

export async function fetchUsedEquipments(): Promise<Equipment[]> {
	const fetchedEquipment: Equipment[] = [];

	try {
		const response = await axios.get(endpoint);
		fetchedEquipment.push(...response.data.data.products.items.map((equipment: any) => mapApiResponseToEquipment(equipment)));
	} catch (error) {
		console.error('Impossible d\'obtenir l\'équipement usagé.', error);
	}

	return fetchedEquipment;
}
  
function mapApiResponseToEquipment(apiResponse: any): Equipment {
	return {
		id: apiResponse.id,
		name: apiResponse.name,
		price: apiResponse.price_range.minimum_price.regular_price.value,
		url: `${gosselinUrl}/${apiResponse.url_key}`,
	};
}