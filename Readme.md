# DrawIo-Devops

![Draw.io](public/img/logo.png)

# About the extension
This Azure DevOps extension is based on [info-emait/DrawIo](https://github.com/info-emait/DrawIo). It bundles the draw.io editor in the extension package so you can open, edit and commit diagrams directly in Azure DevOps.

![Draw.io Example](public/img/screenshot1.gif)

# Features
* List and view draw.io files: `.drawio`, `.svg`, `.png` from all project repositories and wikis.
* Create new diagram files.
* Rename existing diagram files.
* History tracking for diagram files.

# Setup
After installing the extension from the Marketplace, you need to enable it in the **Manage features**  section. In order to do so, follow the instructions [here](https://learn.microsoft.com/en-us/azure/devops/project/navigation/preview-features?view=azure-devops).

# How does it work
Draw.io can be used for editing files with `.drawio` extension (native draw.io format). You can also edit `.png` and `.svg` files, if they were saved from draw.io as **Editable Bitmap Image** or **Editable Vector Image**.

# Project and licenses

This fork is maintained at [Yusufmolla/drawio-devops](https://github.com/Yusufmolla/drawio-devops). Report bugs and feature requests through that repository's Issues.

The original extension's license is preserved in [public/License.md](public/License.md). The bundled draw.io editor has its own [Apache 2.0 license](public/drawio-LICENSE.txt); upstream notices remain included in the editor distribution.
