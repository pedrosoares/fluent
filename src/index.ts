import { Model } from './model';
import { HasOne } from "./has_one";
import { HasMany } from "./has_many";
import { Configurator } from "./configurator";

const configurator = new Configurator();

export { Model, HasOne, HasMany, configurator };
