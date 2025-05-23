import { Test, TestingModule } from '@nestjs/testing';
import { SocialShareService } from './social-share.service';
import { ConfigService } from '@nestjs/config';

describe('SocialShareService', () => {
  let service: SocialShareService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialShareService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SocialShareService>(SocialShareService);
    configService = module.get<ConfigService>(ConfigService);

    // Set up default mock value for APP_URL
    mockConfigService.get.mockReturnValue('https://navilands.com');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateFacebookShareUrl', () => {
    it('should generate correct Facebook share URL', () => {
      const jobId = 123;
      const jobTitle = 'Ship Captain';
      const companyName = 'Ocean Lines';

      const result = service.generateFacebookShareUrl(
        jobId,
        jobTitle,
        companyName,
      );

      const expectedJobUrl = 'https://navilands.com/jobs/123';
      const expectedText = encodeURIComponent(
        'Exciting Maritime Opportunity: Ship Captain at Ocean Lines! 🚢 #MaritimeJobs #Seafarer',
      );
      const expectedUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(expectedJobUrl)}&quote=${expectedText}`;

      expect(result).toBe(expectedUrl);
      expect(configService.get).toHaveBeenCalledWith('APP_URL');
    });
  });

  describe('generateLinkedInShareUrl', () => {
    it('should generate correct LinkedIn share URL', () => {
      const jobId = 123;
      const jobTitle = 'Ship Captain';
      const companyName = 'Ocean Lines';

      const result = service.generateLinkedInShareUrl(
        jobId,
        jobTitle,
        companyName,
      );

      const expectedJobUrl = 'https://navilands.com/jobs/123';
      const expectedTitle = encodeURIComponent(
        'Maritime Career Opportunity: Ship Captain at Ocean Lines',
      );
      const expectedUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(expectedJobUrl)}&title=${expectedTitle}`;

      expect(result).toBe(expectedUrl);
      expect(configService.get).toHaveBeenCalledWith('APP_URL');
    });
  });

  describe('generateTwitterShareUrl', () => {
    it('should generate correct Twitter share URL', () => {
      const jobId = 123;
      const jobTitle = 'Ship Captain';
      const companyName = 'Ocean Lines';

      const result = service.generateTwitterShareUrl(
        jobId,
        jobTitle,
        companyName,
      );

      const expectedJobUrl = 'https://navilands.com/jobs/123';
      const expectedText = encodeURIComponent(
        '🚢 New Maritime Opportunity: Ship Captain at Ocean Lines! Check it out: #MaritimeJobs #Seafarer',
      );
      const expectedUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(expectedJobUrl)}&text=${expectedText}`;

      expect(result).toBe(expectedUrl);
      expect(configService.get).toHaveBeenCalledWith('APP_URL');
    });
  });

  describe('error handling', () => {
    it('should handle missing APP_URL configuration', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const jobId = 123;
      const jobTitle = 'Ship Captain';
      const companyName = 'Ocean Lines';

      const result = service.generateFacebookShareUrl(
        jobId,
        jobTitle,
        companyName,
      );

      // Should still generate a URL with 'undefined' as the base
      expect(result).toContain('undefined/jobs/123');
    });
  });
});
