export class HasMany { }

export class QueryBuilder {
	transaction();
	commit();
	rollback();
	with(...relation: string[]): QueryBuilder;
	where(filter: string | ((qb: QueryBuilder)=> void), val_or_compare?: string, val?: string): QueryBuilder;
	orWhere(filter: string | ((qb: QueryBuilder)=> void), val_or_compare?: string, val?: string): QueryBuilder;
	andWhere(filter: string | ((qb: QueryBuilder)=> void), val_or_compare?: string, val?: string): QueryBuilder;
	groupBy(filter: string | ((qb: QueryBuilder)=> void), val_or_compare?: string, val?: string): QueryBuilder;
	skip(skip: number): QueryBuilder;
	take(take: number): QueryBuilder;
	orderBy(column: string, direction: string): QueryBuilder;
	get<T extends Model>(): Promise<T[]>;
	first<T extends Model>(): Promise<T>;
	firstOrFail<T extends Model>(): Promise<T>;
	insert(): Promise<boolean>;
	create<T extends Model>(data: object, options?: object): Promise<T>;
	delete(options?: object): Promise<undefined>;
	update(data: object, options?: object): Promise<undefined>;
	raw(sql: string, params: undefined[], options?: object): Promise<undefined>;
}

export class Model {
	fill(data: any): void;
	toJSON(): object;
	serialize(ignore_fields?: string[]): object;
	getKeyName(): string;
	getForeignKey(): string;
	query(): QueryBuilder;
	hasMany(related: Model, foreignKey: string | null, localKey: string | null): HasMany;
	static parse<T extends Model>(data: object): T;
	static all<T extends Model>(): T[];
	static insert(bulkData: object[], options?: object): boolean;
	static create<T extends Model>(data: object, options?: object): T;
	static transaction(callback?: (transaction: string, commit: ()=> void, rollback: ()=> void)=> void): Promise<{transaction: string, commit: ()=> void, rollback: ()=> void}>;
	static query(): QueryBuilder;
}
export function Configure(config: any);
