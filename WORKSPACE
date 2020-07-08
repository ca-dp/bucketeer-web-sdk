workspace(
    name = "bucketeer_web_sdk",
    managed_directories = {
        "@npm": ["node_modules"],
    },
)

load(
    "@bazel_tools//tools/build_defs/repo:http.bzl",
    "http_archive",
)

###############################################################################
# NodeJS
###############################################################################
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "84abf7ac4234a70924628baa9a73a5a5cbad944c4358cf9abdb4aab29c9a5b77",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/1.7.0/rules_nodejs-1.7.0.tar.gz"],
)

load(
    "@build_bazel_rules_nodejs//:index.bzl",
    "node_repositories",
    "yarn_install",
)

node_repositories(
    node_repositories = {
        "12.16.3-darwin_amd64": ("node-v12.16.3-darwin-x64.tar.gz", "node-v12.16.3-darwin-x64", "0718812b3ab8e77e8d1354f4d10428ae99d78f721bdcceee527c4b592ea7fed0"),
        "12.16.3-linux_amd64": ("node-v12.16.3-linux-x64.tar.xz", "node-v12.16.3-linux-x64", "1956e196e3c3c8ef5f0c45db76d7c1245af4ccdda2b7ab30a57ce91d6e165caa"),
        "12.16.3-windows_amd64": ("node-v12.16.3-win-x64.zip", "node-v12.16.3-win-x64", "d0bb0e0b1f1a948529ddd543e2cfe0bfe209eb843defc70217b3d2f84cbf3b78"),
    },
    node_urls = ["https://nodejs.org/dist/v{version}/{filename}"],
    node_version = "12.16.3",
    package_json = ["//:package.json"],
    yarn_repositories = {
        "1.19.1": ("yarn-v1.19.1.tar.gz", "yarn-v1.19.1", "34293da6266f2aae9690d59c2d764056053ff7eebc56b80b8df05010c3da9343"),
    },
    yarn_urls = ["https://github.com/yarnpkg/yarn/releases/download/v{version}/{filename}"],
    yarn_version = "1.19.1",
)

yarn_install(
    name = "npm",
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)

load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")

install_bazel_dependencies()

load("@npm_bazel_typescript//:index.bzl", "ts_setup_workspace")

ts_setup_workspace()
