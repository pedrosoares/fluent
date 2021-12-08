export class HasOne { }
export class HasMany { }

export class QueryBuilder {
	transaction();
	commit();
	rollback();
	with(...relation: string[]): QueryBuilder;
	where(filter: string | ((qb: QueryBuilder)=> void), val_or_compare?: string, val?: string): QueryBuilder;
	orWhere(filter: string | ((qb: QueryBuilder)=> void), val_or_compare?: string, val?: string): QueryBuilder;
	andWhere(filter: string | ((qb: QueryBuilder)=> void), val_or_compare?: string, val?: string): QueryBuilder;
	whereRaw(raw: string): QueryBuilder;
	orWhereRaw(raw: string): QueryBuilder;
	andWhereRaw(raw: string): QueryBuilder;
	whereNull(raw: string): QueryBuilder;
	orWhereNull(raw: string): QueryBuilder;
	andWhereNull(raw: string): QueryBuilder;
	whereNotNull(raw: string): QueryBuilder;
	orWhereNotNull(raw: string): QueryBuilder;
	andWhereNotNull(raw: string): QueryBuilder;
	groupBy(filter: string | ((qb: QueryBuilder)=> void), val_or_compare?: string, val?: string): QueryBuilder;
	skip(skip: number): QueryBuilder;
	take(take: number): QueryBuilder;
	orderBy(column: string, direction: string): QueryBuilder;
	get<T extends Model>(): Promise<T[]>;
	count(): Promise<number>;
	first<T extends Model>(): Promise<T>;
	firstOrFail<T extends Model>(): Promise<T>;
	insert(): Promise<boolean>;
	create<T extends Model>(data: object, options?: object): Promise<T>;
	delete(options?: object): Promise<undefined>;
	update(data: object, options?: object): Promise<undefined>;
	raw(sql: string, params: unknown[], options?: object): Promise<undefined>;
}

export class Model {
	fill(data: any): void;
	toJSON(): object;
	serialize(ignore_fields?: string[]): object;
	getKeyName(): string;
	getForeignKey(): string;
	query(): QueryBuilder;
	hasMany<T extends typeof Model>(related: T, foreignKey: string | null, localKey: string | null): HasMany;
	hasOne<T extends typeof Model>(related: T, foreignKey: string | null, localKey: string | null): HasOne;
	static parse<T extends Model>(data: object): T;
	static all<T extends Model>(): T[];
	static insert(bulkData: object[], options?: object): boolean;
	static create<T extends Model>(data: object, options?: object): T;
	static transaction(callback?: (transaction: string, commit: ()=> void, rollback: ()=> void)=> void): Promise<{transaction: string, commit: ()=> void, rollback: ()=> void}>;
	static query(): QueryBuilder;
	save(): Promise<undefined>;
	delete(): Promise<undefined>;
}

export const configurator: {
	use: (configurator: unknown) => void;
	configure: (config: unknown) => void;
};
