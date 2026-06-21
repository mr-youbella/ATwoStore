export interface Ref
{
	designation: string;
	quantity: number;
}

export interface Order
{
	tracking: string;
	price: number;
	name: string;
	phone: string;
	city: string;
	createdAt: string;
	days_ago: number;
	status: string;
	idStatus: number;
	updatedAt: string;
	cash_status?: string;
	paidAt?: string;
	store: string;
	bl: number;
	deliveryCost: number;
	address: string;
	isMyOrder?: boolean;
	refs: Ref[];
}

export interface Pickup
{
	id: number;
	area: string;
	seller_phone: string;
	picker: string;
	picker_phone: string;
}

export interface User
{
	id: number;
	username: string;
	email: string;
	digylog_token?: string;
}
