export class HasMany { }

export class QueryBuilder {
	transaction();
	commit();
	rollback();
	with(...relation: string[]): QueryBuilder;
	where(filter: string | ((qb: QueryBuilder) => {}), val_or_compare: string | null, val: string | null): QueryBuilder;
	orWhere(filter: string | ((qb: QueryBuilder) => {}), val_or_compare: string | null, val: string | null): QueryBuilder;
	andWhere(filter: string | ((qb: QueryBuilder) => {}), val_or_compare: string | null, val: string | null): QueryBuilder;
	groupBy(filter: string | ((qb: QueryBuilder) => {}), val_or_compare: string | null, val: string | null): QueryBuilder;
	skip(skip: number): QueryBuilder;
	take(take: number): QueryBuilder;
	orderBy(column: string, direction: string): QueryBuilder;
	get(): Promise<Model[]>;
	first(): Promise<Model>;
	firstOrFail(): Promise<Model>;
	insert(): Promise<boolean>;
	create(): Promise<Model>;
	delete(): Promise<undefined>;
	update(): Promise<undefined>;
	raw(): Promise<undefined>;
}

export class Model {
	fill(data: any): void;
	toJSON(): object;
	serialize(): object;
	getKeyName(): string;
	getForeignKey(): string;
	query(): QueryBuilder;
	hasMany(related: Model, foreignKey: string | null, localKey: string | null): HasMany;
	static all(): Model[];
	static insert(bulkData: object[], options: object | null): Model;
	static create(data: object, options: object | null): Model;
	static transaction(callback: (transaction: string, commit: () => {}, rollback: () => {}) => {}): Promise<{transaction: string, commit: () => {}, rollback: () => {}}>;
	static query(): QueryBuilder;
}
export function Configure(config: any);
