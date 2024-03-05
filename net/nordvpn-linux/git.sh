#!/bin/bash
#
#	USAGE: git.sh <GIT_URL> <GIT_DIR> <GIT_REF>
#

set -euxo pipefail

error() {
	echo "ERROR: ${*}" >&2
	exit 1
}

GIT_URL="${1}"
if [ -z "${GIT_URL}" ]; then
	error "Git URL not specified"
fi

GIT_DIR="${2}"
if [ -z "${GIT_DIR}" ]; then
	error "Git clone directory not specified"
fi

GIT_REF="${3}"
if [ -z "${GIT_REF}" ]; then
	error "Git reference not specified"
fi

pushd "${GIT_DIR}"
git init --quiet
git remote add origin "${GIT_URL}"
git fetch --all
git fetch --tags
git reset --hard "${GIT_REF}"
popd
