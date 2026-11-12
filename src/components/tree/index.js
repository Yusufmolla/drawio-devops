import { registerComponent } from "@utils/knockout";
import template from "./tree.html?raw";
import { ViewModel } from "./tree.js";
import "./tree.scss";

registerComponent("my-tree", ViewModel, template);