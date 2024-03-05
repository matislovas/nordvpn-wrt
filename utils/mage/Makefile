include $(TOPDIR)/rules.mk

PKG_NAME:=mage
PKG_VERSION:=1.15.0
PKG_RELEASE:=1

PKG_SOURCE:=v$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://github.com/magefile/mage/archive/refs/tags/
PKG_HASH:=3ce55e39d175d925c015b4dc773cea1fc4d3c64af9edcec6f9b7ab9388b751bf

PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE
PKG_MAINTAINER:=Matas Misiunas <matislovas@gmail.com.com>

PKG_BUILD_DEPENDS:=golang/host
HOST_BUILD_DEPENDS:=$(PKG_BUILD_DEPENDS)
PKG_BUILD_PARALLEL:=1
PKG_BUILD_FLAGS:=no-mips16

GO_PKG:=github.com/magefile/mage
GO_PKG_LDFLAGS_X:=main.Version=$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk
include ../../../packages/lang/golang/golang-package.mk
include $(INCLUDE_DIR)/host-build.mk
include ../../../packages/lang/golang/golang-host-build.mk

define Package/mage
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Build tool for golang projects
  URL:=https://github.com/magefile/mage
  DEPENDS:=$(GO_ARCH_DEPENDS)
endef

define Package/mage/description
  Mage is a make-like build tool using Go. 
  You write plain-old go functions, and Mage automatically 
  uses them as Makefile-like runnable targets..
endef

define Package/mage/install
	$(call GoPackage/Package/Install/Bin,$(PKG_INSTALL_DIR))

	$(INSTALL_DIR) $(1)/usr/bin/
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/usr/bin/mage $(1)/usr/bin/
endef

$(eval $(call GoBinPackage,mage))
$(eval $(call BuildPackage,mage))
$(eval $(call GoBinHostBuild))
$(eval $(call HostBuild))
