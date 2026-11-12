import { registerComponent } from "@utils/knockout";
import template from "./zerodata.html?raw";
import { ViewModel } from "./zerodata.js";
import "./zerodata.scss";

registerComponent("my-zerodata", ViewModel, template);