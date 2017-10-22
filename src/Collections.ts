/*
 * Created by Ivan Sanz (@isc30)
 * Copyright © 2017 Ivan Sanz Carasa. All rights reserved.
*/

// tslint:disable-next-line:max-line-length
import { RangeEnumerable, OrderedEnumerable, IOrderedEnumerable, UniqueEnumerable, ConcatEnumerable, TransformEnumerable, ConditionalEnumerable, ReverseEnumerable, Enumerable, IEnumerable, ArrayEnumerable, IQueryable } from "./Enumerables";
import { Action, Selector,  Aggregator,  Predicate } from "./Types";
import { Comparer, createComparer } from "./Comparers";
import { IIterable } from "./Iterators";

interface IKeyValuePair<TKey, TValue>
{
    key: TKey;
    value: TValue;
}

/*export interface ICollection<TElement> extends IQueryable<TElement>
{
    copy(): ICollection<TElement>;

    add(element: TElement): void;
    addRange(elements: TElement[] | IQueryable<TElement>): void;
    clear(): void;
    remove(element: TElement): void;
}*/

export interface IList<TElement> extends IQueryable<TElement>
{
    copy(): IList<TElement>;

    asArray(): TElement[];
    clear(): void;
    get(index: number): TElement | undefined;
    push(element: TElement): number;
    pushRange(elements: TElement[] | IQueryable<TElement>): number;
    pushFront(element: TElement): number;
    pop(): TElement | undefined;
    popFront(): TElement | undefined;
    remove(element: TElement): void;
    removeAt(index: number): TElement | undefined;
    set(index: number, element: TElement): void;
    indexOf(element: TElement): number;
    insert(index: number, element: TElement): void;
}

export class List<TElement> implements IList<TElement>
{
    protected source: TElement[];

    public constructor();
    public constructor(elements: TElement[])
    public constructor(elements: TElement[] = [])
    {
        this.source = elements;
    }

    public asEnumerable(): IEnumerable<TElement>
    {
        return new ArrayEnumerable(this.source);
    }

    public asArray(): TElement[]
    {
        return this.source;
    }

    public toArray(): TElement[]
    {
        return ([] as TElement[]).concat(this.source);
    }

    public copy(): IList<TElement>
    {
        return new List<TElement>(this.toArray());
    }

    public toList(): IList<TElement>
    {
        return this.copy();
    }

    public clear(): void
    {
        this.source = [];
    }

    public remove(element: TElement): void
    {
        const newSource: TElement[] = [];

        for (let i = 0, end = this.source.length; i < end; ++i)
        {
            if (this.source[i] !== element)
            {
                newSource.push(this.source[i]);
            }
        }

        this.source = newSource;
    }

    public removeAt(index: number): TElement | undefined
    {
        if (index < 0 || this.source[index] === undefined)
        {
            throw new Error("Out of bounds");
        }

        return this.source.splice(index, 1)[0];
    }

    public get(index: number): TElement | undefined
    {
        return this.source[index];
    }

    public push(element: TElement): number
    {
        return this.source.push(element);
    }

    public pushRange(elements: TElement[] | IQueryable<TElement>): number
    {
        if (!Array.isArray(elements))
        {
            elements = elements.toArray();
        }

        return this.source.push.apply(this.source, elements);
    }

    public pushFront(element: TElement): number
    {
        return this.source.unshift(element);
    }

    public pop(): TElement | undefined
    {
        return this.source.pop();
    }

    public popFront(): TElement | undefined
    {
        return this.source.shift();
    }

    public set(index: number, element: TElement): void
    {
        if (index < 0)
        {
            throw new Error("Out of bounds");
        }

        this.source[index] = element;
    }

    public insert(index: number, element: TElement): void
    {
        if (index < 0 || index > this.source.length)
        {
            throw new Error("Out of bounds");
        }

        this.source.splice(index, 0, element);
    }

    public indexOf(element: TElement): number
    {
        return this.source.indexOf(element);
    }

    /////////////////////////////////////////////////////////////////////////////////////
    // Collection

    public aggregate(aggregator: Aggregator<TElement, TElement | undefined>): TElement;
    public aggregate<TValue>(aggregator: Aggregator<TElement, TValue>, initialValue: TValue): TValue;
    public aggregate<TValue>(
        aggregator: Aggregator<TElement, TValue | TElement | undefined>,
        initialValue?: TValue): TValue | TElement
    {
        if (initialValue !== undefined)
        {
            return this.source.reduce(
                aggregator as Aggregator<TElement, TValue>,
                initialValue);
        }

        return this.source.reduce(aggregator as Aggregator<TElement, TElement>);
    }

    public any(): boolean;
    public any(predicate: Predicate<TElement>): boolean;
    public any(predicate?: Predicate<TElement>): boolean
    {
        if (predicate !== undefined)
        {
            return this.source.some(predicate);
        }

        return this.source.length > 0;
    }

    public all(predicate: Predicate<TElement>): boolean
    {
        return this.source.every(predicate);
    }

    public average(selector: Selector<TElement, number>): number
    {
        if (this.count() === 0)
        {
            throw new Error("Sequence contains no elements");
        }

        let sum = 0;

        for (let i = 0, end = this.source.length; i < end; ++i)
        {
            sum += selector(this.source[i]);
        }

        return sum / this.source.length;
    }

    public count(): number;
    public count(predicate: Predicate<TElement>): number;
    public count(predicate?: Predicate<TElement>): number
    {
        if (predicate !== undefined)
        {
            return this.source.filter(predicate).length;
        }

        return this.source.length;
    }

    public concat(
        other: TElement[] | IQueryable<TElement>,
        ...others: Array<TElement[] | IQueryable<TElement>>)
        : IEnumerable<TElement>
    {
        return this.asEnumerable().concat(other, ...others);
    }

    public elementAtOrDefault(index: number): TElement | undefined
    {
        if (index < 0)
        {
            throw new Error("Negative index is forbiden");
        }

        return this.source[index];
    }

    public firstOrDefault(): TElement | undefined;
    public firstOrDefault(predicate: Predicate<TElement>): TElement | undefined;
    public firstOrDefault(predicate?: Predicate<TElement>): TElement | undefined
    {
        if (predicate !== undefined)
        {
            return this.source.filter(predicate)[0];
        }

        return this.source[0];
    }

    public lastOrDefault(): TElement | undefined;
    public lastOrDefault(predicate: Predicate<TElement>): TElement | undefined;
    public lastOrDefault(predicate?: Predicate<TElement>): TElement | undefined
    {
        if (predicate !== undefined)
        {
            const records = this.source.filter(predicate);

            return records[records.length - 1];
        }

        return this.source[this.source.length - 1];
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////

    public reverse(): IEnumerable<TElement>
    {
        return new ReverseEnumerable<TElement>(this.asEnumerable());
    }

    public contains(element: TElement): boolean
    {
        return this.any(e => e === element);
    }

    public where(predicate: Predicate<TElement>): IEnumerable<TElement>
    {
        return new ConditionalEnumerable<TElement>(this.asEnumerable(), predicate);
    }

    public select<TSelectorOut>(selector: Selector<TElement, TSelectorOut>): IEnumerable<TSelectorOut>
    {
        return new TransformEnumerable<TElement, TSelectorOut>(this.asEnumerable(), selector);
    }

    public selectMany<TSelectorOut>(
        selector: Selector<TElement, TSelectorOut[] | List<TSelectorOut> | IEnumerable<TSelectorOut>>)
        : IEnumerable<TSelectorOut>
    {
        const selectToEnumerable = (e: TElement) =>
        {
            const ie = selector(e);

            return Array.isArray(ie)
                ? new ArrayEnumerable(ie)
                : ie.asEnumerable();
        };

        return this
            .select(selectToEnumerable).toArray()
            .reduce((p, c) => new ConcatEnumerable(p, c), Enumerable.empty()) as IEnumerable<TSelectorOut>;
    }

    public elementAt(index: number): TElement
    {
        const element = this.elementAtOrDefault(index);

        if (element === undefined)
        {
            throw new Error("Out of bounds");
        }

        return element;
    }

    public except(other: IQueryable<TElement>): IEnumerable<TElement>
    {
        return this.asEnumerable().except(other);
    }

    public first(): TElement;
    public first(predicate: Predicate<TElement>): TElement;
    public first(predicate?: Predicate<TElement>): TElement
    {
        let element: TElement | undefined;

        if (predicate !== undefined)
        {
            element = this.firstOrDefault(predicate);
        }
        else
        {
            element = this.firstOrDefault();
        }

        if (element === undefined)
        {
            throw new Error("Sequence contains no elements");
        }

        return element;
    }

    public forEach(action: Action<TElement>): void
    {
        for (let i = 0, end = this.source.length; i < end; ++i)
        {
            action(this.source[i], i);
        }
    }

    public last(): TElement;
    public last(predicate: Predicate<TElement>): TElement;
    public last(predicate?: Predicate<TElement>): TElement
    {
        let element: TElement | undefined;

        if (predicate !== undefined)
        {
            element = this.lastOrDefault(predicate);
        }
        else
        {
            element = this.lastOrDefault();
        }

        if (element === undefined)
        {
            throw new Error("Sequence contains no elements");
        }

        return element;
    }

    public single(): TElement;
    public single(predicate: Predicate<TElement>): TElement;
    public single(predicate?: Predicate<TElement>): TElement
    {
        let element: TElement | undefined;

        if (predicate !== undefined)
        {
            element = this.singleOrDefault(predicate);
        }
        else
        {
            element = this.singleOrDefault();
        }

        if (element === undefined)
        {
            throw new Error("Sequence contains no elements");
        }

        return element;
    }

    public singleOrDefault(): TElement | undefined;
    public singleOrDefault(predicate: Predicate<TElement>): TElement | undefined;
    public singleOrDefault(predicate?: Predicate<TElement>): TElement | undefined
    {
        if (predicate !== undefined)
        {
            return this.asEnumerable().singleOrDefault(predicate);
        }

        return this.asEnumerable().singleOrDefault();
    }

    public distinct(): IEnumerable<TElement>;
    public distinct<TKey>(keySelector: Selector<TElement, TKey>): IEnumerable<TElement>;
    public distinct<TKey>(keySelector?: Selector<TElement, TKey>): IEnumerable<TElement>
    {
        return new UniqueEnumerable(this.asEnumerable(), keySelector);
    }

    public min(): TElement;
    public min<TSelectorOut>(selector: Selector<TElement, TSelectorOut>): TSelectorOut;
    public min<TSelectorOut>(selector?: Selector<TElement, TSelectorOut>): TElement | TSelectorOut
    {
        if (selector !== undefined)
        {
            // Don't copy iterators
            return new TransformEnumerable<TElement, TSelectorOut>(this.asEnumerable(), selector).min();
        }

        return this.aggregate((previous, current) =>
            (previous !== undefined && previous < current)
                ? previous
                : current);
    }

    public orderBy<TKey>(
        keySelector: Selector<TElement, TKey>): IOrderedEnumerable<TElement>;
    public orderBy<TKey>(
        keySelector: Selector<TElement, TKey>,
        comparer: Comparer<TKey>): IOrderedEnumerable<TElement>;
    public orderBy<TKey>(
        keySelector: Selector<TElement, TKey>,
        comparer?: Comparer<TKey>): IOrderedEnumerable<TElement>
    {
        return new OrderedEnumerable(this.asEnumerable(), createComparer(keySelector, true, comparer));
    }

    public orderByDescending<TKey>(
        keySelector: Selector<TElement, TKey>): IOrderedEnumerable<TElement>
    {
        return new OrderedEnumerable(this.asEnumerable(), createComparer(keySelector, false, undefined));
    }

    public max(): TElement;
    public max<TSelectorOut>(selector: Selector<TElement, TSelectorOut>): TSelectorOut;
    public max<TSelectorOut>(selector?: Selector<TElement, TSelectorOut>): TElement | TSelectorOut
    {
        if (selector !== undefined)
        {
            // Don't copy iterators
            return new TransformEnumerable<TElement, TSelectorOut>(this.asEnumerable(), selector).max();
        }

        return this.aggregate((previous, current) =>
            (previous !== undefined && previous > current)
                ? previous
                : current);
    }

    public sum(selector: Selector<TElement, number>): number
    {
        return this.aggregate(
            (previous: number, current: TElement) => previous + selector(current), 0);
    }

    public skip(amount: number): IEnumerable<TElement>
    {
        return new RangeEnumerable<TElement>(this.asEnumerable(), amount, undefined);
    }

    public take(amount: number): IEnumerable<TElement>
    {
        return new RangeEnumerable<TElement>(this.asEnumerable(), undefined, amount);
    }

    public union(other: IQueryable<TElement>): IEnumerable<TElement>
    {
        return new UniqueEnumerable(this.concat(other));
    }
}
