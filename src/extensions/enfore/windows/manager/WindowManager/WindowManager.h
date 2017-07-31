#import <Foundation/Foundation.h>
#import "MOJavaScriptObject.h"

@interface WindowManager : NSObject

+ (void)start;

+ (void)doItWithACallback:(MOJavaScriptObject *)callback;

@end
