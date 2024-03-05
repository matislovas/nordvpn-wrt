include $(TOPDIR)/rules.mk

PKG_NAME:=mage
PKG_VERSION:=1.15.0
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/magefile/mage/tar.gz/v$(PKG_VERSION)
PKG_HASH:=31747ae633213f1eda3842686f83c2aa1412e0f5691d1c14dbbcc67fe7400cea

HOST_BUILD_DEPENDS:=golang/host
# PKG_BUILD_DEPENDS:=golang/host

include $(INCLUDE_DIR)/host-build.mk
# include $(INCLUDE_DIR)/package.mk
include ../../../packages/lang/golang/golang-host-build.mk
# include ../../packages/lang/golang/golang-package.mk

GO_PKG:=github.com/magefile/mage

# define Package/mage
#   SECTION:=utils
#   CATEGORY:=Utilities
#   TITLE:=Build tool for golang projects
#   URL:=https://github.com/magefile/mage
# endef

# define Package/mage/install
# 	$(INSTALL_DIR) $(1)/usr/bin
# 	$(INSTALL_BIN) $(PKG_BUILD_DIR)/mage/mage $(1)/usr/bin/
# endef

# define Host/Configure
# endef

# define Host/Compile
# 	$(call GoPackage/Build/Compile)
# endef

# define Host/Install
# 	$(INSTALL_DIR) $(STAGING_DIR_HOST)/bin
# 	$(INSTALL_BIN) $(HOST_BUILD_DIR)/mage $(STAGING_DIR_HOST)/bin/
# endef

# define Host/Clean
# 	$(call Host/Clean/Default)
# 	rm -f $(STAGING_DIR_HOST)/bin/mage
# endef

$(eval $(call GoBinPackage,mage))
$(eval $(call BuildPackage,mage))
$(eval $(call GoBinHostBuild))
$(eval $(call HostBuild))
