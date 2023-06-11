import { ethers } from 'ethers'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import { useAccount } from 'wagmi'

import { Skeleton, Tag, Typography, mq } from '@ensdomains/thorin'

import { cacheableComponentStyles } from '@app/components/@atoms/CacheableComponent'
import { DisabledButtonWithTooltip } from '@app/components/@molecules/DisabledButtonWithTooltip'
import RecordItem from '@app/components/RecordItem'
import { useHasGlobalError } from '@app/hooks/errors/useHasGlobalError'
import { useResolverType } from '@app/hooks/resolver/useResolverType'
import { useTransactionFlow } from '@app/transaction-flow/TransactionFlowProvider'

import { TabWrapper } from '../../../TabWrapper'
import BaseWrapButton from './Token/BaseWrapButton'

const Container = styled(TabWrapper)(
  cacheableComponentStyles,
  ({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: ${theme.space['4']};

    padding: ${theme.space['4']};

    ${mq.sm.min(css`
      padding: ${theme.space['6']};
    `)}
  `,
)

const HeadingContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    & > button {
      color: ${theme.colors.accent};
      font-weight: ${theme.fontWeights.bold};
      padding: 0 ${theme.space['2']};
    }
  `,
)

const InnerHeading = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: ${theme.space['4']};

    & > div:first-of-type {
      font-size: ${theme.fontSizes.headingFour};
      font-weight: ${theme.fontWeights.bold};
    }
  `,
)

const TagsContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: ${theme.space['1']};
  `,
)

const Resolver = ({
  name,
  isWrapped,
  canEditResolver,
  canEdit,
  resolverAddress,
  isCachedData,
}: {
  name: string
  isWrapped: boolean
  canEditResolver: boolean
  canEdit: boolean
  resolverAddress: string | undefined
  isCachedData: boolean
}) => {
  const { t } = useTranslation('profile')

  const hasGlobalError = useHasGlobalError()

  const { prepareDataInput } = useTransactionFlow()
  const { address } = useAccount()
  const showEditResolverInput = prepareDataInput('EditResolver')
  const handleEditClick = () => {
    showEditResolverInput(`resolver-upgrade-${name}`, {
      name,
    })
  }
  const handleEditGnosisResolver = async () => {
    const GNOSIS_RESOLVER = '0xB4A824f381e77b40346EBa86CC34eE7252e041F2'

    const iface = new ethers.utils.Interface([
      // eslint-disable-next-line max-len
      'function setResolver(bytes32 node,address resolver) public',
    ])
    await window.ethereum!.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: address,
          to: '0x114D4603199df73e7D157787f8778E21fCd13066', // NameWrapper
          data: iface.encodeFunctionData('setResolver', [
            ethers.utils.namehash(name),
            GNOSIS_RESOLVER,
          ]),
        },
      ],
    })
  }

  const { data: { type: resolverType, tone, isWildcard } = {}, isLoading: isResolverTypeLoading } =
    useResolverType(name, {
      isWrapped,
      resolverAddress,
    })

  return (
    <Skeleton loading={isResolverTypeLoading} style={{ width: '100%', borderRadius: '16px' }}>
      <Container $isCached={isCachedData}>
        <HeadingContainer>
          <InnerHeading>
            <Typography color="text" fontVariant="headingFour" weight="bold">
              {t('tabs.more.resolver.label')}
            </Typography>
            <TagsContainer>
              <Tag colorStyle={tone!}>{t(`tabs.more.resolver.${resolverType}`)}</Tag>
              {isWildcard && (
                <Tag colorStyle="greySecondary">{t('tabs.more.resolver.wildcard')}</Tag>
              )}
            </TagsContainer>
          </InnerHeading>
          {canEdit && !hasGlobalError && (
            <>
              {canEditResolver ? (
                <button
                  style={{ cursor: 'pointer' }}
                  type="button"
                  onClick={handleEditClick}
                  data-testid="edit-resolver-button"
                >
                  {t('action.edit', { ns: 'common' })}
                </button>
              ) : (
                <DisabledButtonWithTooltip
                  {...{
                    buttonId: 'set-resolver-disabled-button',
                    content: t(`errors.permissionRevoked`),
                    buttonText: 'Edit',
                    mobileWidth: 150,
                    buttonWidth: '15',
                    mobileButtonWidth: 'initial',
                    colorStyle: 'transparent',
                  }}
                />
              )}
            </>
          )}
        </HeadingContainer>
        <RecordItem type="text" data-testid="resolver-address" value={resolverAddress || ''} />
        <Typography color="text" fontVariant="headingFour" weight="bold">
          Add Resolv3r
        </Typography>
        <Typography color="text" fontVariant="small">
          Deploy Resolv3r on your favorite Blockchain and leverage your ENS Identidy there
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Typography color="text" weight="bold">
              Gnosis Chain
            </Typography>
            <Typography color="text" fontVariant="small">
              Gas costs below .1 USD
            </Typography>
            <BaseWrapButton
              onClick={handleEditGnosisResolver}
              style={{ backgroundColor: '#133629', maxWidth: 'max-content', marginTop: '8px' }}
              data-testid="unwrap-name-btn"
            >
              Deploy Gnosis Resolv3r
            </BaseWrapButton>
          </div>
          <div>
            <Typography color="text" weight="bold">
              Optimism
            </Typography>
            <Typography color="text" fontVariant="small">
              Gas costs are optimistic.
            </Typography>

            <BaseWrapButton
              style={{
                backgroundColor: 'rgb(255, 4, 32)',
                maxWidth: 'max-content',
                marginTop: '8px',
              }}
              data-testid="unwrap-name-btn"
            >
              Deploy Optimism Resolv3r
            </BaseWrapButton>
          </div>
          <div>
            <Typography color="text" weight="bold">
              Mantle
            </Typography>
            <Typography color="text" fontVariant="small">
              You downloaded music on bittorent
            </Typography>
            <BaseWrapButton
              style={{
                backgroundColor: 'rgb(204, 233, 231)',
                maxWidth: 'max-content',
                color: 'black',
                marginTop: '8px',
              }}
              data-testid="unwrap-name-btn"
            >
              Deploy Mantel Resolv3r
            </BaseWrapButton>
          </div>
        </div>
      </Container>
    </Skeleton>
  )
}

export default Resolver
